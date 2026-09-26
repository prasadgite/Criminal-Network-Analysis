import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import {
  LoginDto,
  JwtPayload,
  InvestigatorRecord,
  AuthSessionResponse,
  AuthenticatedUserDto,
  AccessRequestPayloadDto,
  AccessRequestResponse,
  AccessRequestStatusResponse,
} from './auth.types';
import { SandhaanRole, ROLE_PERMISSIONS } from './authorization/permissions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private mapRolePermissions(role: string): string[] {
    const normalized = (role || '').toLowerCase().trim();
    const effectiveRole: SandhaanRole =
      normalized === 'cyber_cell_admin' || normalized === 'admin'
        ? 'administrator'
        : (normalized as SandhaanRole);

    const auth05Permissions = Array.from(ROLE_PERMISSIONS[effectiveRole] || ROLE_PERMISSIONS.investigator);

    const legacyPermissions = [
      'cases:read',
      'entities:read',
      'network:read',
      'timeline:read',
      'locations:read',
      'findings:read',
      'evidence:read',
    ];

    if (effectiveRole === 'administrator' || effectiveRole === 'supervisor') {
      legacyPermissions.push(
        'cases:write',
        'entities:write',
        'evidence:write',
        'admin:access',
        'admin:access-requests:read',
        'admin:access-requests:write',
      );
    }

    return Array.from(new Set([...auth05Permissions, ...legacyPermissions]));
  }

  async validateInvestigator(userIdOrEmail: string): Promise<InvestigatorRecord | null> {
    const trimmed = userIdOrEmail.trim();

    // 1. Check investigators table first
    const invQuery = `
      SELECT id, investigator_id, full_name, email, password_hash, role, clearance_level, status, must_activate, created_at, updated_at, last_login_at
      FROM investigators
      WHERE (LOWER(investigator_id) = LOWER($1) OR LOWER(email) = LOWER($1))
      LIMIT 1;
    `;
    const invRes = await this.db.query<InvestigatorRecord>(invQuery, [trimmed]);
    if (invRes.rows[0]) {
      return invRes.rows[0];
    }

    // 2. Check users table with user_credentials
    const userQuery = `
      SELECT u.id, u.official_id AS investigator_id, u.full_name, u.email, uc.password_hash, u.role,
             'Level 4 - Cyber Command' AS clearance_level,
             CASE WHEN u.status = 'ACTIVE' THEN 'active' ELSE LOWER(u.status) END AS status,
             CASE WHEN u.status = 'PENDING_ACTIVATION' OR uc.credential_status = 'PENDING' OR uc.must_change_password = TRUE THEN TRUE ELSE FALSE END AS must_activate,
             u.created_at, u.updated_at, uc.last_login_at
      FROM users u
      JOIN user_credentials uc ON uc.user_id = u.id
      WHERE (LOWER(u.official_id) = LOWER($1) OR LOWER(u.email) = LOWER($1))
      LIMIT 1;
    `;
    const userRes = await this.db.query<InvestigatorRecord>(userQuery, [trimmed]);
    return userRes.rows[0] || null;
  }

  async validateInvestigatorById(investigatorId: string): Promise<AuthenticatedUserDto | null> {
    const trimmed = investigatorId.trim();

    // Check investigators table
    const invQuery = `
      SELECT id, investigator_id, full_name, email, role, clearance_level, status
      FROM investigators
      WHERE LOWER(investigator_id) = LOWER($1) AND status = 'active'
      LIMIT 1;
    `;
    const invRes = await this.db.query(invQuery, [trimmed]);
    const invRow = invRes.rows[0];
    if (invRow) {
      return {
        userId: invRow.investigator_id,
        displayName: invRow.full_name,
        email: invRow.email,
        role: invRow.role,
        clearanceLevel: invRow.clearance_level,
        permissions: this.mapRolePermissions(invRow.role),
      };
    }

    // Check users table
    const userQuery = `
      SELECT id, official_id, full_name, email, role, 'Level 4 - Cyber Command' AS clearance_level, status
      FROM users
      WHERE LOWER(official_id) = LOWER($1) AND status = 'ACTIVE'
      LIMIT 1;
    `;
    const userRes = await this.db.query(userQuery, [trimmed]);
    const userRow = userRes.rows[0];
    if (userRow) {
      return {
        userId: userRow.official_id,
        displayName: userRow.full_name,
        email: userRow.email,
        role: userRow.role,
        clearanceLevel: userRow.clearance_level,
        permissions: this.mapRolePermissions(userRow.role),
      };
    }

    return null;
  }

  async createAccessRequest(
    payload: AccessRequestPayloadDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AccessRequestResponse> {
    const {
      fullName,
      officialId,
      officialEmail,
      officialPhone,
      organization,
      department,
      designation,
      rank,
      jurisdiction,
      officeUnit,
      supervisorName,
      supervisorId,
      purpose,
      authorizationDocument,
    } = payload;

    if (
      !fullName?.trim() ||
      !officialId?.trim() ||
      !officialEmail?.trim() ||
      !officialPhone?.trim() ||
      !organization?.trim() ||
      !department?.trim() ||
      !designation?.trim() ||
      !rank?.trim() ||
      !jurisdiction?.trim() ||
      !officeUnit?.trim() ||
      !supervisorName?.trim() ||
      !supervisorId?.trim() ||
      !purpose?.trim()
    ) {
      throw new BadRequestException('All required official fields must be provided.');
    }

    // Generate unique application number e.g. SAR-2026-000184
    const appNum = `SAR-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const query = `
      INSERT INTO access_requests (
        application_number,
        full_name,
        official_id,
        official_email,
        official_phone,
        organization,
        department,
        designation,
        rank,
        jurisdiction,
        office_unit,
        supervisor_name,
        supervisor_id,
        purpose,
        authorization_document,
        status,
        submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'PENDING', NOW())
      RETURNING application_number, status, submitted_at;
    `;

    const res = await this.db.query(query, [
      appNum,
      fullName.trim(),
      officialId.trim(),
      officialEmail.trim().toLowerCase(),
      officialPhone.trim(),
      organization.trim(),
      department.trim(),
      designation.trim(),
      rank.trim(),
      jurisdiction.trim(),
      officeUnit.trim(),
      supervisorName.trim(),
      supervisorId.trim(),
      purpose.trim(),
      authorizationDocument || null,
    ]);

    const created = res.rows[0];

    // Log audit
    await this.db.query(`
      INSERT INTO access_audit_logs (
        actor_user_id, action, target_type, target_id, result, ip_address, user_agent, metadata
      ) VALUES ($1, 'ACCESS_REQUEST_CREATED', 'access_request', $2, 'SUCCESS', $3, $4, $5)
    `, [
      officialId.trim(),
      created.application_number,
      ipAddress || null,
      userAgent || null,
      JSON.stringify({ email: officialEmail, department, organization }),
    ]);

    this.logger.log(`Created access request: ${created.application_number} for ${fullName} (${officialId})`);

    return {
      applicationNumber: created.application_number,
      status: created.status,
      submittedAt: new Date(created.submitted_at).toISOString(),
    };
  }

  async getAccessRequestStatus(applicationNumber: string): Promise<AccessRequestStatusResponse> {
    const query = `
      SELECT application_number, status, submitted_at, reviewed_at, review_notes
      FROM access_requests
      WHERE UPPER(application_number) = UPPER($1)
      LIMIT 1;
    `;
    const res = await this.db.query(query, [applicationNumber.trim()]);
    const row = res.rows[0];

    if (!row) {
      throw new NotFoundException(`Application '${applicationNumber}' not found. Please verify the application number.`);
    }

    return {
      applicationNumber: row.application_number,
      status: row.status,
      submittedAt: new Date(row.submitted_at).toISOString(),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : undefined,
      reviewNotes: row.review_notes || undefined,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthSessionResponse> {
    const identifier = (loginDto.officialId || loginDto.userId || '').trim();
    const { password } = loginDto;
    this.logger.log(`Authentication attempt for identifier: ${identifier}`);

    const investigator = await this.validateInvestigator(identifier);

    if (!investigator) {
      this.logger.warn(`Authentication failed: User ${identifier} not found`);
      // Log audit
      await this.db.query(`
        INSERT INTO access_audit_logs (
          actor_user_id, action, target_type, target_id, result, ip_address, user_agent
        ) VALUES ($1, 'LOGIN_FAILED', 'user', $1, 'FAILURE', $2, $3)
      `, [identifier, ipAddress || null, userAgent || null]);

      throw new UnauthorizedException('Invalid investigator credentials');
    }

    const normalizedStatus = (investigator.status || '').toLowerCase();

    if (normalizedStatus === 'pending_activation' || investigator.must_activate) {
      this.logger.warn(`Login rejected: Account ${identifier} requires first-time activation`);
      throw new HttpException(
        {
          code: 'ACCOUNT_ACTIVATION_REQUIRED',
          message: 'First-time account activation is required.',
          investigatorId: investigator.investigator_id,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (normalizedStatus === 'suspended') {
      this.logger.warn(`Login rejected: Account ${identifier} is suspended`);
      throw new HttpException(
        {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Investigator account is suspended.',
          investigatorId: investigator.investigator_id,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (normalizedStatus === 'revoked') {
      this.logger.warn(`Login rejected: Account ${identifier} has been revoked`);
      throw new HttpException(
        {
          code: 'ACCOUNT_REVOKED',
          message: 'Investigator account has been revoked.',
          investigatorId: investigator.investigator_id,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (normalizedStatus !== 'active') {
      this.logger.warn(`Authentication rejected: Investigator ${identifier} account status is '${investigator.status}'`);
      throw new UnauthorizedException('Investigator account is deactivated or suspended');
    }

    const isPasswordValid = await bcrypt.compare(password, investigator.password_hash);
    if (!isPasswordValid) {
      this.logger.warn(`Authentication failed: Invalid password for ${identifier}`);
      // Log audit
      await this.db.query(`
        INSERT INTO access_audit_logs (
          actor_user_id, action, target_type, target_id, result, ip_address, user_agent
        ) VALUES ($1, 'LOGIN_FAILED', 'user', $1, 'FAILURE', $2, $3)
      `, [identifier, ipAddress || null, userAgent || null]);

      throw new UnauthorizedException('Invalid investigator credentials');
    }

    // Update last_login_at
    await this.db.query(
      'UPDATE investigators SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
      [investigator.id],
    );

    // Log audit
    await this.db.query(`
      INSERT INTO access_audit_logs (
        actor_user_id, action, target_type, target_id, result, ip_address, user_agent
      ) VALUES ($1, 'LOGIN_SUCCESS', 'user', $1, 'SUCCESS', $2, $3)
    `, [identifier, ipAddress || null, userAgent || null]);

    const payload: JwtPayload = {
      sub: investigator.id,
      investigatorId: investigator.investigator_id,
      role: investigator.role,
      clearanceLevel: investigator.clearance_level,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const user: AuthenticatedUserDto = {
      userId: investigator.investigator_id,
      displayName: investigator.full_name,
      email: investigator.email,
      role: investigator.role,
      clearanceLevel: investigator.clearance_level,
      permissions: this.mapRolePermissions(investigator.role),
    };

    this.logger.log(`Authentication successful for ${investigator.investigator_id} (${investigator.full_name})`);

    return {
      accessToken,
      user,
      expiresAt,
    };
  }

  async getProfile(investigatorId: string): Promise<AuthenticatedUserDto> {
    const user = await this.validateInvestigatorById(investigatorId);
    if (!user) {
      throw new UnauthorizedException('Investigator profile not found or inactive');
    }
    return user;
  }
}
