import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityReference } from './entities.service';

export interface InvestigationEvidence {
  evidenceId: string;
  evidenceType: string;
  title: string;
  description?: string;
  status: 'collected' | 'verified' | 'under_review' | 'disputed' | 'archived';
  reliability: 'low' | 'medium' | 'high' | 'unknown';
  caseId?: string;
  entityReferences: EntityReference[];
  timelineEventIds: string[];
  locationId?: string;
  findingIds: string[];
  sourceDataset?: string;
  sourceRecordId?: string;
  collectedAt?: string;
  verifiedAt?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(private readonly db: DatabaseService) {}

  async listEvidence(
    caseId?: string,
    evidenceType?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: InvestigationEvidence[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (caseId) {
      conditions.push(`e.case_id = $${idx++}`);
      params.push(caseId);
    }
    if (evidenceType) {
      conditions.push(`e.evidence_type ILIKE $${idx++}`);
      params.push(`%${evidenceType}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.db.query(
      `SELECT COUNT(*) as cnt FROM evidence e ${whereClause};`,
      params,
    );
    const total = parseInt(countRes.rows[0].cnt, 10);

    const query = `
      SELECT 
        e.evidence_id, e.case_id, e.evidence_type, e.file_name, e.file_path,
        e.source, e.collected_by, e.collection_timestamp,
        e.integrity_status, e.chain_of_custody_id, e.access_level, e.created_at
      FROM evidence e
      ${whereClause}
      ORDER BY e.collection_timestamp DESC NULLS LAST
      LIMIT $${idx++} OFFSET $${idx++};
    `;
    params.push(limit, offset);

    const res = await this.db.query(query, params);
    const evidenceList: InvestigationEvidence[] = [];

    for (const row of res.rows) {
      const linksRes = await this.db.query(
        `SELECT target_type, target_id, relationship
         FROM evidence_links
         WHERE evidence_id = $1
         LIMIT 10;`,
        [row.evidence_id],
      );

      const entityReferences: EntityReference[] = linksRes.rows.map((l) => ({
        entityId: l.target_id,
        entityType: (l.target_type || 'unknown').toLowerCase() as any,
        label: `${l.target_id} (${l.relationship || 'Linked'})`,
      }));

      evidenceList.push({
        evidenceId: row.evidence_id,
        evidenceType: (row.evidence_type || 'document').toLowerCase(),
        title: row.file_name || `Evidence ${row.evidence_id}`,
        description: `Source: ${row.source || 'Investigation'}, Path: ${row.file_path || 'N/A'}`,
        status: row.integrity_status === 'Verified' ? 'verified' : 'collected',
        reliability: 'high',
        caseId: row.case_id,
        entityReferences,
        timelineEventIds: [],
        findingIds: [],
        sourceDataset: 'evidence',
        sourceRecordId: row.evidence_id,
        collectedAt: row.collection_timestamp,
        metadata: {
          collectedBy: row.collected_by,
          chainOfCustodyId: row.chain_of_custody_id,
          accessLevel: row.access_level,
          integrityStatus: row.integrity_status,
        },
      });
    }

    return { data: evidenceList, total };
  }

  async getEvidenceById(evidenceId: string): Promise<InvestigationEvidence | null> {
    const res = await this.db.query(
      `SELECT * FROM evidence WHERE evidence_id = $1 LIMIT 1;`,
      [evidenceId],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const linksRes = await this.db.query(
      `SELECT target_type, target_id, relationship
       FROM evidence_links
       WHERE evidence_id = $1;`,
      [evidenceId],
    );

    const entityReferences: EntityReference[] = linksRes.rows.map((l) => ({
      entityId: l.target_id,
      entityType: (l.target_type || 'unknown').toLowerCase() as any,
      label: `${l.target_id} (${l.relationship || 'Linked'})`,
    }));

    return {
      evidenceId: row.evidence_id,
      evidenceType: (row.evidence_type || 'document').toLowerCase(),
      title: row.file_name || `Evidence ${row.evidence_id}`,
      description: `Source: ${row.source || 'Investigation'}, Path: ${row.file_path || 'N/A'}`,
      status: row.integrity_status === 'Verified' ? 'verified' : 'collected',
      reliability: 'high',
      caseId: row.case_id,
      entityReferences,
      timelineEventIds: [],
      findingIds: [],
      sourceDataset: 'evidence',
      sourceRecordId: row.evidence_id,
      collectedAt: row.collection_timestamp,
      metadata: row,
    };
  }
}
