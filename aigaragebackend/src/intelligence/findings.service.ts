import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityReference } from './entities.service';

export interface InvestigationFinding {
  findingId: string;
  findingType: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'under_review' | 'confirmed' | 'dismissed' | 'archived';
  confidence: number;
  caseId?: string;
  entityReferences: EntityReference[];
  relationshipIds: string[];
  timelineEventIds: string[];
  locationIds: string[];
  supportingEvidenceIds: string[];
  detectionSource: string;
  sourceDataset?: string;
  sourceRecordIds?: string[];
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class FindingsService {
  private readonly logger = new Logger(FindingsService.name);

  constructor(private readonly db: DatabaseService) {}

  async generateFindings(
    caseId?: string,
    limit: number = 30,
  ): Promise<{ data: InvestigationFinding[]; total: number }> {
    const findings: InvestigationFinding[] = [];

    // 1. High-Frequency Communication Burst (CDR Clusters)
    try {
      const cdrBurstQuery = `
        SELECT caller_phone_id, receiver_phone_id, COUNT(*) as call_count, SUM(duration_seconds) as total_duration
        FROM cdr_records
        GROUP BY caller_phone_id, receiver_phone_id
        HAVING COUNT(*) >= 8
        ORDER BY call_count DESC
        LIMIT 10;
      `;
      const cdrBursts = await this.db.query(cdrBurstQuery);

      for (let i = 0; i < cdrBursts.rows.length; i++) {
        const row = cdrBursts.rows[i];
        findings.push({
          findingId: `FND-COMM-00${i + 1}`,
          findingType: 'communication_pattern',
          title: `Dense Communication Link (${row.call_count} calls)`,
          description: `Repetitive high-frequency call exchange detected between phone ${row.caller_phone_id} and ${row.receiver_phone_id} totaling ${Math.round(row.total_duration / 60)} minutes.`,
          severity: parseInt(row.call_count, 10) > 12 ? 'high' : 'medium',
          priority: 'high',
          status: 'confirmed',
          confidence: 0.94,
          entityReferences: [
            { entityId: row.caller_phone_id, entityType: 'phone', label: row.caller_phone_id },
            { entityId: row.receiver_phone_id, entityType: 'phone', label: row.receiver_phone_id },
          ],
          relationshipIds: [`REL-CDR-${row.caller_phone_id}-${row.receiver_phone_id}`],
          timelineEventIds: [],
          locationIds: [],
          supportingEvidenceIds: [],
          detectionSource: 'statistical_model',
          sourceDataset: 'cdr_records',
          sourceRecordIds: [row.caller_phone_id, row.receiver_phone_id],
          createdAt: new Date().toISOString(),
          metadata: { callCount: parseInt(row.call_count, 10), totalDurationSeconds: parseInt(row.total_duration, 10) },
        });
      }
    } catch (e) {
      this.logger.error('Error finding CDR communication patterns', e);
    }

    // 2. High-Value Financial Anomalies (Transactions)
    try {
      const txAnomalies = await this.db.query(`
        SELECT transaction_id, sender_account_id, receiver_account_id, amount, currency, timestamp, transaction_type
        FROM transactions
        WHERE amount >= 150000
        ORDER BY amount DESC
        LIMIT 10;
      `);

      for (let i = 0; i < txAnomalies.rows.length; i++) {
        const row = txAnomalies.rows[i];
        const formattedAmount = `₹${parseFloat(row.amount).toLocaleString('en-IN')}`;
        findings.push({
          findingId: `FND-FIN-00${i + 1}`,
          findingType: 'financial_pattern',
          title: `High-Value Fund Transfer: ${formattedAmount}`,
          description: `Single high-value ${row.transaction_type} of ${formattedAmount} routed from account ${row.sender_account_id} to ${row.receiver_account_id}.`,
          severity: parseFloat(row.amount) > 180000 ? 'critical' : 'high',
          priority: 'critical',
          status: 'new',
          confidence: 0.98,
          entityReferences: [
            { entityId: row.sender_account_id, entityType: 'bank_account', label: `Sender: ${row.sender_account_id}` },
            { entityId: row.receiver_account_id, entityType: 'bank_account', label: `Receiver: ${row.receiver_account_id}` },
          ],
          relationshipIds: [`REL-TXN-${row.transaction_id}`],
          timelineEventIds: [`TL-TXN-${row.transaction_id}`],
          locationIds: [],
          supportingEvidenceIds: [],
          detectionSource: 'rule',
          sourceDataset: 'transactions',
          sourceRecordIds: [row.transaction_id],
          createdAt: row.timestamp || new Date().toISOString(),
          metadata: { amount: parseFloat(row.amount), channel: row.transaction_type },
        });
      }
    } catch (e) {
      this.logger.error('Error finding financial patterns', e);
    }

    // 3. Multi-Case Repeat Suspects
    try {
      const multiCaseRes = await this.db.query(`
        SELECT ce.source_entity_id, ce.source_entity_type, COUNT(DISTINCT ce.case_id) as case_count,
               array_agg(DISTINCT ce.case_id) as case_ids,
               COALESCE(p.full_name, ph.phone_number, ce.source_entity_id) as label
        FROM case_entities ce
        LEFT JOIN persons p ON ce.source_entity_type = 'person' AND ce.source_entity_id = p.person_id
        LEFT JOIN phones ph ON ce.source_entity_type = 'phone' AND ce.source_entity_id = ph.phone_id
        GROUP BY ce.source_entity_id, ce.source_entity_type, p.full_name, ph.phone_number
        HAVING COUNT(DISTINCT ce.case_id) >= 2
        ORDER BY case_count DESC
        LIMIT 10;
      `);

      for (let i = 0; i < multiCaseRes.rows.length; i++) {
        const row = multiCaseRes.rows[i];
        findings.push({
          findingId: `FND-MC-00${i + 1}`,
          findingType: 'suspicious_relationship',
          title: `Cross-Case Repeat Subject: ${row.label}`,
          description: `Entity identified across ${row.case_count} independent investigation cases (${(row.case_ids || []).join(', ')}).`,
          severity: 'critical',
          priority: 'critical',
          status: 'confirmed',
          confidence: 0.95,
          caseId: row.case_ids?.[0],
          entityReferences: [
            { entityId: row.source_entity_id, entityType: (row.source_entity_type || 'unknown').toLowerCase() as any, label: row.label },
          ],
          relationshipIds: [],
          timelineEventIds: [],
          locationIds: [],
          supportingEvidenceIds: [],
          detectionSource: 'graph_analysis',
          sourceDataset: 'case_entities',
          sourceRecordIds: row.case_ids || [],
          createdAt: new Date().toISOString(),
          metadata: { caseCount: parseInt(row.case_count, 10), caseIds: row.case_ids },
        });
      }
    } catch (e) {
      this.logger.error('Error finding multi-case patterns', e);
    }

    return {
      data: findings.slice(0, limit),
      total: findings.length,
    };
  }
}
