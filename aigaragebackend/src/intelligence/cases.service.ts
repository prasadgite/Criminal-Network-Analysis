import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityReference } from './entities.service';

export interface InvestigationCase {
  caseId: string;
  caseNumber: string;
  title: string;
  status: 'open' | 'active' | 'under_review' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  entityReferences: EntityReference[];
  relationshipIds: string[];
  timelineEventIds: string[];
  locationIds: string[];
  evidenceIds: string[];
  findingIds: string[];
  sourceDataset?: string;
  sourceRecordId?: string;
  createdAt: string;
  updatedAt?: string;
  closedAt?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(private readonly db: DatabaseService) {}

  async listCases(
    status?: string,
    priority?: string,
    search?: string,
    limit: number = 25,
    offset: number = 0,
  ): Promise<{ data: InvestigationCase[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (status) {
      const s = status.toLowerCase();
      if (s === 'open') {
        conditions.push(`c.case_status ILIKE ANY(ARRAY['%registered%', '%open%'])`);
      } else if (s === 'closed') {
        conditions.push(`c.case_status ILIKE ANY(ARRAY['%close%', '%disposed%', '%solved%'])`);
      } else if (s === 'under_review') {
        conditions.push(`c.case_status ILIKE ANY(ARRAY['%review%', '%pending%', '%chargesheet%'])`);
      } else if (s === 'active') {
        conditions.push(`c.case_status ILIKE ANY(ARRAY['%investigation%', '%pending%', '%chargesheet%', '%active%'])`);
      } else {
        conditions.push(`c.case_status ILIKE $${idx++}`);
        params.push(`%${status}%`);
      }
    }

    if (priority) {
      conditions.push(`c.severity ILIKE $${idx++}`);
      params.push(`%${priority}%`);
    }

    if (search) {
      conditions.push(`(c.fir_number ILIKE $${idx} OR c.description ILIKE $${idx} OR c.crime_category ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.db.query(
      `SELECT COUNT(*) as cnt FROM cases c ${whereClause};`,
      params,
    );
    const total = parseInt(countRes.rows[0].cnt, 10);

    const query = `
      SELECT 
        c.case_id, c.fir_number, c.police_station_id, c.district, c.city, c.state,
        c.crime_category, c.crime_subcategory, c.severity, c.case_status,
        c.incident_date, c.registration_date, c.description, c.investigating_officer_id
      FROM cases c
      ${whereClause}
      ORDER BY c.incident_date DESC NULLS LAST
      LIMIT $${idx++} OFFSET $${idx++};
    `;
    params.push(limit, offset);

    const res = await this.db.query(query, params);
    const cases: InvestigationCase[] = [];

    for (const row of res.rows) {
      // Get associated entities for this case from case_entities
      const entitiesRes = await this.db.query(
        `SELECT ce.relationship_id, ce.source_entity_id, ce.source_entity_type, ce.relationship_type,
                ce.target_entity_id, ce.target_entity_type
         FROM case_entities ce
         WHERE ce.case_id = $1
         LIMIT 20;`,
        [row.case_id],
      );

      const entityReferences: EntityReference[] = [];
      const relationshipIds: string[] = [];
      const locationIds: string[] = [];

      for (const e of entitiesRes.rows) {
        if (e.relationship_id) relationshipIds.push(e.relationship_id);

        if (e.source_entity_id !== row.case_id) {
          entityReferences.push({
            entityId: e.source_entity_id,
            entityType: e.source_entity_type as any,
            label: `${e.source_entity_id} (${e.relationship_type || 'Source'})`,
          });
          if (e.source_entity_type === 'Location' && !locationIds.includes(e.source_entity_id)) {
            locationIds.push(e.source_entity_id);
          }
        }

        if (e.target_entity_id && e.target_entity_id !== row.case_id && e.target_entity_id !== e.source_entity_id) {
          entityReferences.push({
            entityId: e.target_entity_id,
            entityType: e.target_entity_type as any,
            label: `${e.target_entity_id} (${e.relationship_type || 'Target'})`,
          });
          if (e.target_entity_type === 'Location' && !locationIds.includes(e.target_entity_id)) {
            locationIds.push(e.target_entity_id);
          }
        }
      }

      cases.push({
        caseId: row.case_id,
        caseNumber: row.fir_number || row.case_id,
        title: `${row.crime_category || 'Investigation'}: ${row.fir_number || row.case_id}`,
        status: this.mapStatus(row.case_status),
        priority: this.mapPriority(row.severity),
        description: row.description,
        entityReferences,
        relationshipIds,
        timelineEventIds: [],
        locationIds,
        evidenceIds: [],
        findingIds: [],
        sourceDataset: 'cases',
        sourceRecordId: row.case_id,
        createdAt: row.registration_date ? new Date(row.registration_date).toISOString() : new Date().toISOString(),
        metadata: {
          policeStationId: row.police_station_id,
          district: row.district,
          city: row.city,
          state: row.state,
          crimeCategory: row.crime_category,
          crimeSubcategory: row.crime_subcategory,
          incidentDate: row.incident_date,
          investigatingOfficerId: row.investigating_officer_id,
        },
      });
    }

    return { data: cases, total };
  }

  async getCaseById(caseId: string): Promise<InvestigationCase | null> {
    const res = await this.db.query(
      `SELECT * FROM cases WHERE case_id = $1 LIMIT 1;`,
      [caseId],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const entitiesRes = await this.db.query(
      `SELECT ce.relationship_id, ce.source_entity_id, ce.source_entity_type, ce.relationship_type,
              ce.target_entity_id, ce.target_entity_type
       FROM case_entities ce
       WHERE ce.case_id = $1;`,
      [caseId],
    );

    const entityReferences: EntityReference[] = [];
    const relationshipIds: string[] = [];
    const locationIds: string[] = [];

    for (const e of entitiesRes.rows) {
      if (e.relationship_id) relationshipIds.push(e.relationship_id);

      if (e.source_entity_id !== caseId) {
        entityReferences.push({
          entityId: e.source_entity_id,
          entityType: e.source_entity_type as any,
          label: `${e.source_entity_id} (${e.relationship_type || 'Subject'})`,
        });
        if (e.source_entity_type === 'Location' && !locationIds.includes(e.source_entity_id)) {
          locationIds.push(e.source_entity_id);
        }
      }

      if (e.target_entity_id && e.target_entity_id !== caseId && e.target_entity_id !== e.source_entity_id) {
        entityReferences.push({
          entityId: e.target_entity_id,
          entityType: e.target_entity_type as any,
          label: `${e.target_entity_id} (${e.relationship_type || 'Target'})`,
        });
        if (e.target_entity_type === 'Location' && !locationIds.includes(e.target_entity_id)) {
          locationIds.push(e.target_entity_id);
        }
      }
    }

    const evRes = await this.db.query(
      `SELECT evidence_id FROM evidence WHERE case_id = $1;`,
      [caseId],
    );
    const evidenceIds = evRes.rows.map((r) => r.evidence_id);

    return {
      caseId: row.case_id,
      caseNumber: row.fir_number || row.case_id,
      title: `${row.crime_category || 'Case'}: ${row.fir_number || row.case_id}`,
      status: this.mapStatus(row.case_status),
      priority: this.mapPriority(row.severity),
      description: row.description,
      entityReferences,
      relationshipIds,
      timelineEventIds: [],
      locationIds,
      evidenceIds,
      findingIds: [],
      sourceDataset: 'cases',
      sourceRecordId: row.case_id,
      createdAt: row.registration_date ? new Date(row.registration_date).toISOString() : new Date().toISOString(),
      metadata: row,
    };
  }

  private mapStatus(status?: string): 'open' | 'active' | 'under_review' | 'closed' | 'archived' {
    if (!status) return 'active';
    const s = status.toLowerCase();
    if (s.includes('close') || s.includes('disposed')) return 'closed';
    if (s.includes('archive')) return 'archived';
    if (s.includes('review')) return 'under_review';
    if (s.includes('open') || s.includes('registered')) return 'open';
    return 'active';
  }

  private mapPriority(severity?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!severity) return 'medium';
    const s = severity.toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'low') return 'low';
    return 'medium';
  }
}
