import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface AuditEventParams {
  actorUserId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  result: 'SUCCESS' | 'FAILURE';
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly db: DatabaseService) {}

  async log(params: AuditEventParams, client?: any): Promise<void> {
    const {
      actorUserId = null,
      action,
      targetType = null,
      targetId = null,
      result,
      ipAddress = null,
      userAgent = null,
      metadata = null,
    } = params;

    const query = `
      INSERT INTO access_audit_logs (
        actor_user_id, action, target_type, target_id, result, ip_address, user_agent, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW());
    `;

    try {
      const runner = client || this.db;
      await runner.query(query, [
        actorUserId,
        action,
        targetType,
        targetId,
        result,
        ipAddress,
        userAgent,
        metadata ? JSON.stringify(metadata) : null,
      ]);
    } catch (err: any) {
      this.logger.error(`Failed to record audit log for action ${action}: ${err.message}`, err.stack);
    }
  }

  async record(
    action: string,
    targetType: string,
    targetId: string,
    result: 'SUCCESS' | 'FAILURE' | 'FAILED' | 'DENIED',
    context: { ipAddress?: string; userAgent?: string; actorInvestigatorId?: string } = {},
    metadata?: Record<string, any>,
  ): Promise<void> {
    return this.log({
      actorUserId: context.actorInvestigatorId || (targetType === 'investigator' || targetType === 'user' ? targetId : null),
      action,
      targetType,
      targetId,
      result: result === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata,
    });
  }
}
