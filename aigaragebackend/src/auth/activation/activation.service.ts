import {
  BadRequestException,
  ConflictException,
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../audit/audit.service';
import { ActivateAccountDto } from './dto/activate-account.dto';

export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Too Many Requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

const MAX_ACTIVATION_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class ActivationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async getStatus(investigatorId: string) {
    const result = await this.db.query(
      `SELECT
         investigator_id,
         full_name,
         email,
         role,
         clearance_level,
         status,
         must_activate,
         activation_code_expires_at,
         activation_locked_until
       FROM investigators
       WHERE lower(investigator_id) = lower($1)
       LIMIT 1`,
      [investigatorId.trim()],
    );

    if (!result.rows.length) {
      throw new NotFoundException('Investigator account not found');
    }

    const row = result.rows[0];

    return {
      investigatorId: row.investigator_id,
      displayName: row.full_name,
      email: row.email,
      role: row.role,
      clearanceLevel: row.clearance_level,
      status: row.status,
      activationRequired: Boolean(row.must_activate),
      activationCredentialExpired:
        row.activation_code_expires_at
          ? new Date(row.activation_code_expires_at).getTime() <= Date.now()
          : true,
      activationLocked:
        row.activation_locked_until
          ? new Date(row.activation_locked_until).getTime() > Date.now()
          : false,
    };
  }

  async activate(dto: ActivateAccountDto, context: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    const clientResult = await this.db.query(
      `SELECT
         id,
         investigator_id,
         full_name,
         email,
         role,
         clearance_level,
         status,
         password_hash,
         must_activate,
         activation_code_hash,
         activation_code_expires_at,
         activation_attempts,
         activation_locked_until
       FROM investigators
       WHERE lower(investigator_id) = lower($1)
       LIMIT 1`,
      [dto.investigatorId.trim()],
    );

    if (!clientResult.rows.length) {
      throw new NotFoundException('Investigator account not found');
    }

    const account = clientResult.rows[0];

    if (!account.must_activate || account.status !== 'pending_activation') {
      throw new ConflictException(
        'This investigator account is not awaiting first-time activation',
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$/;
    if (!dto.newPassword || !passwordRegex.test(dto.newPassword)) {
      throw new BadRequestException(
        'Password must be at least 12 characters and contain uppercase, lowercase, number and special character',
      );
    }

    if (
      account.activation_locked_until &&
      new Date(account.activation_locked_until).getTime() > Date.now()
    ) {
      throw new TooManyRequestsException(
        'Activation is temporarily locked. Try again later.',
      );
    }

    if (
      !account.activation_code_hash ||
      !account.activation_code_expires_at ||
      new Date(account.activation_code_expires_at).getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'Activation credential has expired. Contact the Cyber Cell for re-issuance.',
      );
    }

    const codeMatches = await bcrypt.compare(
      dto.activationCode.trim(),
      account.activation_code_hash,
    );

    if (!codeMatches) {
      const attempts = Number(account.activation_attempts ?? 0) + 1;

      if (attempts >= MAX_ACTIVATION_ATTEMPTS) {
        await this.db.query(
          `UPDATE investigators
           SET activation_attempts = $1,
               activation_locked_until = NOW() + ($2 || ' minutes')::interval,
               updated_at = NOW()
           WHERE id = $3`,
          [attempts, LOCK_MINUTES, account.id],
        );

        await this.audit.record(
          'ACCOUNT_ACTIVATION_LOCKED',
          'investigator',
          account.investigator_id,
          'FAILED',
          context,
          { attempts, lockMinutes: LOCK_MINUTES },
        );

        throw new TooManyRequestsException(
          `Activation locked after ${MAX_ACTIVATION_ATTEMPTS} failed attempts`,
        );
      }

      await this.db.query(
        `UPDATE investigators
         SET activation_attempts = $1, updated_at = NOW()
         WHERE id = $2`,
        [attempts, account.id],
      );

      await this.audit.record(
        'ACCOUNT_ACTIVATION_FAILED',
        'investigator',
        account.investigator_id,
        'FAILED',
        context,
        { attempts },
      );

      throw new BadRequestException('Invalid activation credential');
    }

    // The activation code is one-time: consume it in the same transaction
    // that establishes the permanent password and activates the account.
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    const result = await this.db.withTransaction(async (client) => {
      const locked = await client.query(
        `SELECT id, status, must_activate, activation_code_hash
         FROM investigators
         WHERE id = $1
         FOR UPDATE`,
        [account.id],
      );

      if (
        !locked.rows.length ||
        locked.rows[0].status !== 'pending_activation' ||
        !locked.rows[0].must_activate
      ) {
        throw new ConflictException('Account activation state changed');
      }

      const consumed = await client.query(
        `UPDATE investigators
         SET password_hash = $1,
             status = 'active',
             must_activate = FALSE,
             activation_code_hash = NULL,
             activation_code_expires_at = NULL,
             activation_attempts = 0,
             activation_locked_until = NULL,
             password_changed_at = NOW(),
             updated_at = NOW()
         WHERE id = $2
         RETURNING
           investigator_id,
           full_name,
           email,
           role,
           clearance_level,
           status`,
        [passwordHash, account.id],
      );

      await this.audit.record(
        'ACCOUNT_ACTIVATED',
        'investigator',
        account.investigator_id,
        'SUCCESS',
        context,
        { role: account.role },
      );

      return consumed.rows[0];
    });

    return {
      activated: true,
      investigator: result,
      nextStep: 'LOGIN',
      message: 'Account activated. You may now sign in with your Investigator ID and new password.',
    };
  }
}
