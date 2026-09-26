import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUserDto } from '../auth.types';
import {
  AccessRequestStatus,
  AssignedRole,
} from './dto/access-request-status.enum';
import {
  ReviewAccessRequestDto,
} from './dto/review-access-request.dto';
import { AccessRequestQueryDto } from './dto/access-request-query.dto';

export interface AccessRequestSummary {
  id: number;
  applicationNumber: string;
  fullName: string;
  officialId: string;
  officialEmail: string;
  officialPhone: string;
  organization: string;
  department: string;
  designation: string;
  rank?: string;
  jurisdiction: string;
  officeUnit?: string;
  supervisorName: string;
  supervisorId: string;
  purpose: string;
  status: AccessRequestStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
}

export interface AccessRequestStats {
  pending: number;
  underReview: number;
  approved: number;
  moreInfoRequired: number;
  rejected: number;
  total: number;
}

export interface PaginatedAccessRequests {
  data: AccessRequestSummary[];
  total: number;
  limit: number;
  offset: number;
  stats: AccessRequestStats;
}

@Injectable()
export class AdminAccessService {
  private readonly logger = new Logger(AdminAccessService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  private mapRowToSummary(row: any): AccessRequestSummary {
    return {
      id: row.id,
      applicationNumber: row.application_number,
      fullName: row.full_name,
      officialId: row.official_id,
      officialEmail: row.official_email,
      officialPhone: row.official_phone,
      organization: row.organization,
      department: row.department,
      designation: row.designation,
      rank: row.rank || undefined,
      jurisdiction: row.jurisdiction,
      officeUnit: row.office_unit || undefined,
      supervisorName: row.supervisor_name,
      supervisorId: row.supervisor_id,
      purpose: row.purpose,
      status: row.status as AccessRequestStatus,
      submittedAt: new Date(row.submitted_at || row.created_at).toISOString(),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null,
      reviewedBy: row.reviewed_by || null,
      reviewNotes: row.review_notes || null,
    };
  }

  async listAccessRequests(query: AccessRequestQueryDto): Promise<PaginatedAccessRequests> {
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 25));
    const offset = Math.max(0, Number(query.offset) || 0);

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (query.status && query.status.trim() !== '' && query.status.toUpperCase() !== 'ALL') {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status.toUpperCase().trim());
    }

    if (query.search && query.search.trim() !== '') {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        `(application_number ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex} OR official_id ILIKE $${paramIndex} OR official_email ILIKE $${paramIndex} OR department ILIKE $${paramIndex})`,
      );
      values.push(term);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch total count matching criteria
    const countSql = `SELECT COUNT(*) AS count FROM access_requests ${whereClause};`;
    const countRes = await this.db.query(countSql, values);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    // Fetch paginated records
    const dataSql = `
      SELECT *
      FROM access_requests
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    const dataRes = await this.db.query(dataSql, [...values, limit, offset]);

    // Fetch stats for all applications
    const statsSql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
        COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW') AS under_review,
        COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
        COUNT(*) FILTER (WHERE status = 'MORE_INFORMATION_REQUIRED') AS more_info_required,
        COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected,
        COUNT(*) AS total
      FROM access_requests;
    `;
    const statsRes = await this.db.query(statsSql);
    const rawStats = statsRes.rows[0] || {};
    const stats: AccessRequestStats = {
      pending: parseInt(rawStats.pending || '0', 10),
      underReview: parseInt(rawStats.under_review || '0', 10),
      approved: parseInt(rawStats.approved || '0', 10),
      moreInfoRequired: parseInt(rawStats.more_info_required || '0', 10),
      rejected: parseInt(rawStats.rejected || '0', 10),
      total: parseInt(rawStats.total || '0', 10),
    };

    return {
      data: dataRes.rows.map((row) => this.mapRowToSummary(row)),
      total,
      limit,
      offset,
      stats,
    };
  }

  async getAccessRequestById(idOrAppNum: string): Promise<AccessRequestSummary> {
    const isNumeric = /^\d+$/.test(idOrAppNum.trim());
    let query: string;
    let params: any[];

    if (isNumeric) {
      query = `SELECT * FROM access_requests WHERE id = $1 LIMIT 1;`;
      params = [parseInt(idOrAppNum.trim(), 10)];
    } else {
      query = `SELECT * FROM access_requests WHERE UPPER(application_number) = UPPER($1) LIMIT 1;`;
      params = [idOrAppNum.trim()];
    }

    const res = await this.db.query(query, params);
    if (!res.rows[0]) {
      throw new NotFoundException(`Access request '${idOrAppNum}' was not found.`);
    }

    return this.mapRowToSummary(res.rows[0]);
  }

  async reviewAccessRequest(
    idOrAppNum: string,
    dto: ReviewAccessRequestDto,
    reviewer: AuthenticatedUserDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; accessRequest: AccessRequestSummary; user?: any }> {
    const isNumeric = /^\d+$/.test(idOrAppNum.trim());
    const findSql = isNumeric
      ? `SELECT * FROM access_requests WHERE id = $1 LIMIT 1;`
      : `SELECT * FROM access_requests WHERE UPPER(application_number) = UPPER($1) LIMIT 1;`;
    const findParams = isNumeric ? [parseInt(idOrAppNum.trim(), 10)] : [idOrAppNum.trim()];

    const existingRes = await this.db.query(findSql, findParams);
    const request = existingRes.rows[0];

    if (!request) {
      throw new NotFoundException(`Access request '${idOrAppNum}' was not found.`);
    }

    const previousStatus = request.status;
    const { action, role, reviewNotes } = dto;

    if (previousStatus === AccessRequestStatus.APPROVED && action === 'APPROVE') {
      throw new BadRequestException('This application has already been approved and provisioned.');
    }

    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      let updatedRow: any;
      let provisionedUser: any = null;

      if (action === 'APPROVE') {
        const assignedRole = role || AssignedRole.INVESTIGATOR;

        // 1. Update access_request
        const updateSql = `
          UPDATE access_requests
          SET status = 'APPROVED',
              reviewed_by = $1,
              reviewed_at = NOW(),
              review_notes = $2,
              updated_at = NOW()
          WHERE id = $3
          RETURNING *;
        `;
        const updateRes = await client.query(updateSql, [
          reviewer.userId,
          reviewNotes || 'Approved by Cyber Cell Verification Officer',
          request.id,
        ]);
        updatedRow = updateRes.rows[0];

        // 2. Transactionally provision record in users table
        const insertUserSql = `
          INSERT INTO users (
            official_id,
            email,
            full_name,
            organization,
            department,
            designation,
            rank,
            role,
            status,
            access_request_id,
            approved_at,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING_ACTIVATION', $9, NOW(), NOW(), NOW())
          ON CONFLICT (official_id)
          DO UPDATE SET
            role = EXCLUDED.role,
            status = 'PENDING_ACTIVATION',
            access_request_id = EXCLUDED.access_request_id,
            approved_at = NOW(),
            updated_at = NOW()
          RETURNING id, official_id, email, full_name, role, status;
        `;

        const userRes = await client.query(insertUserSql, [
          request.official_id,
          request.official_email,
          request.full_name,
          request.organization,
          request.department,
          request.designation,
          request.rank || null,
          assignedRole,
          request.id,
        ]);
        provisionedUser = userRes.rows[0];

        // 3. Create initial temporary credential in user_credentials
        // Generate a random temporary password hash (must change password upon first activation)
        const tempRandomSecret = crypto.randomBytes(18).toString('hex');
        const tempPasswordHash = await bcrypt.hash(tempRandomSecret, 12);

        await client.query(`
          INSERT INTO user_credentials (
            user_id,
            password_hash,
            credential_status,
            must_change_password,
            created_at,
            updated_at
          ) VALUES ($1, $2, 'PENDING', TRUE, NOW(), NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET
            credential_status = 'PENDING',
            must_change_password = TRUE,
            updated_at = NOW();
        `, [provisionedUser.id, tempPasswordHash]);

        // 3b. Provision/sync record in investigators table with AUTH-04 activation credential
        const rawActivationCode = 'ACT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const activationCodeHash = await bcrypt.hash(rawActivationCode, 12);

        await client.query(`
          INSERT INTO investigators (
            investigator_id,
            full_name,
            email,
            password_hash,
            role,
            clearance_level,
            status,
            must_activate,
            activation_code_hash,
            activation_code_expires_at,
            activation_attempts,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, 'Level 3 - Secret', 'pending_activation', TRUE, $6, NOW() + INTERVAL '24 hours', 0, NOW(), NOW())
          ON CONFLICT (investigator_id)
          DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            status = 'pending_activation',
            must_activate = TRUE,
            activation_code_hash = EXCLUDED.activation_code_hash,
            activation_code_expires_at = EXCLUDED.activation_code_expires_at,
            activation_attempts = 0,
            activation_locked_until = NULL,
            updated_at = NOW();
        `, [
          request.official_id,
          request.full_name,
          request.official_email,
          tempPasswordHash,
          assignedRole.toLowerCase(),
          activationCodeHash,
        ]);

        provisionedUser = {
          ...provisionedUser,
          activationCode: rawActivationCode,
        };

        // 4. Audit Log: ACCESS_REQUEST_REVIEWED
        await this.auditService.log(
          {
            actorUserId: reviewer.userId,
            action: 'ACCESS_REQUEST_REVIEWED',
            targetType: 'access_request',
            targetId: request.application_number,
            result: 'SUCCESS',
            ipAddress,
            userAgent,
            metadata: {
              action: 'APPROVE',
              assignedRole,
              previousStatus,
              newStatus: 'APPROVED',
              reviewNotes: reviewNotes || null,
            },
          },
          client,
        );

        // 5. Audit Log: USER_PROVISIONED
        await this.auditService.log(
          {
            actorUserId: reviewer.userId,
            action: 'USER_PROVISIONED',
            targetType: 'user',
            targetId: provisionedUser.official_id,
            result: 'SUCCESS',
            ipAddress,
            userAgent,
            metadata: {
              userId: provisionedUser.id,
              officialId: provisionedUser.official_id,
              role: assignedRole,
              status: 'PENDING_ACTIVATION',
              applicationNumber: request.application_number,
            },
          },
          client,
        );

        this.logger.log(
          `Application ${request.application_number} approved by ${reviewer.userId}. Provisioned user ${provisionedUser.official_id} (${assignedRole}) with status PENDING_ACTIVATION.`,
        );

      } else if (action === 'REJECT') {
        if (!reviewNotes || reviewNotes.trim() === '') {
          throw new BadRequestException('A reason for rejection must be provided in review notes.');
        }

        const updateSql = `
          UPDATE access_requests
          SET status = 'REJECTED',
              reviewed_by = $1,
              reviewed_at = NOW(),
              review_notes = $2,
              updated_at = NOW()
          WHERE id = $3
          RETURNING *;
        `;
        const updateRes = await client.query(updateSql, [
          reviewer.userId,
          reviewNotes.trim(),
          request.id,
        ]);
        updatedRow = updateRes.rows[0];

        await this.auditService.log(
          {
            actorUserId: reviewer.userId,
            action: 'ACCESS_REQUEST_REVIEWED',
            targetType: 'access_request',
            targetId: request.application_number,
            result: 'SUCCESS',
            ipAddress,
            userAgent,
            metadata: {
              action: 'REJECT',
              previousStatus,
              newStatus: 'REJECTED',
              reason: reviewNotes.trim(),
            },
          },
          client,
        );

        this.logger.log(`Application ${request.application_number} rejected by ${reviewer.userId}.`);

      } else if (action === 'REQUEST_INFORMATION') {
        if (!reviewNotes || reviewNotes.trim() === '') {
          throw new BadRequestException(
            'Details on what additional information is required must be provided in review notes.',
          );
        }

        const updateSql = `
          UPDATE access_requests
          SET status = 'MORE_INFORMATION_REQUIRED',
              reviewed_by = $1,
              reviewed_at = NOW(),
              review_notes = $2,
              updated_at = NOW()
          WHERE id = $3
          RETURNING *;
        `;
        const updateRes = await client.query(updateSql, [
          reviewer.userId,
          reviewNotes.trim(),
          request.id,
        ]);
        updatedRow = updateRes.rows[0];

        await this.auditService.log(
          {
            actorUserId: reviewer.userId,
            action: 'ACCESS_REQUEST_REVIEWED',
            targetType: 'access_request',
            targetId: request.application_number,
            result: 'SUCCESS',
            ipAddress,
            userAgent,
            metadata: {
              action: 'REQUEST_INFORMATION',
              previousStatus,
              newStatus: 'MORE_INFORMATION_REQUIRED',
              notes: reviewNotes.trim(),
            },
          },
          client,
        );

        this.logger.log(
          `Application ${request.application_number} marked MORE_INFORMATION_REQUIRED by ${reviewer.userId}.`,
        );

      } else if (action === 'UNDER_REVIEW') {
        const updateSql = `
          UPDATE access_requests
          SET status = 'UNDER_REVIEW',
              reviewed_by = $1,
              reviewed_at = NOW(),
              updated_at = NOW()
          WHERE id = $2
          RETURNING *;
        `;
        const updateRes = await client.query(updateSql, [reviewer.userId, request.id]);
        updatedRow = updateRes.rows[0];

        await this.auditService.log(
          {
            actorUserId: reviewer.userId,
            action: 'ACCESS_REQUEST_REVIEWED',
            targetType: 'access_request',
            targetId: request.application_number,
            result: 'SUCCESS',
            ipAddress,
            userAgent,
            metadata: {
              action: 'UNDER_REVIEW',
              previousStatus,
              newStatus: 'UNDER_REVIEW',
            },
          },
          client,
        );
      } else {
        throw new BadRequestException(`Unrecognized review action: '${action}'`);
      }

      await client.query('COMMIT');

      return {
        message:
          action === 'APPROVE' && provisionedUser?.activationCode
            ? `Application ${request.application_number} approved. One-time activation code: ${provisionedUser.activationCode}`
            : `Application ${request.application_number} successfully updated: ${action}`,
        accessRequest: this.mapRowToSummary(updatedRow),
        user: provisionedUser,
      };
    } catch (err: any) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to review access request ${request?.application_number}: ${err.message}`, err.stack);
      throw err;
    } finally {
      client.release();
    }
  }
}
