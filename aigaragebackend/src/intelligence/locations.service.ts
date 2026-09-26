import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityReference } from './entities.service';

export interface InvestigationLocation {
  locationId: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  entityReferences: EntityReference[];
  caseIds: string[];
  timelineEventIds: string[];
  firstObserved?: string;
  lastObserved?: string;
  sourceDataset?: string;
  sourceRecordId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private readonly db: DatabaseService) {}

  async listLocations(
    city?: string,
    query?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: InvestigationLocation[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (city) {
      conditions.push(`city ILIKE $${idx++}`);
      params.push(`%${city.trim()}%`);
    }
    if (query) {
      conditions.push(`(location_name ILIKE $${idx} OR address ILIKE $${idx} OR location_id ILIKE $${idx})`);
      params.push(`%${query.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.db.query(
      `SELECT COUNT(*) as cnt FROM locations ${whereClause};`,
      params,
    );
    const total = parseInt(countRes.rows[0].cnt, 10);

    const sql = `
      SELECT location_id, location_name, location_type, address, area, city, district, state, pincode, latitude, longitude, sensitivity_level
      FROM locations
      ${whereClause}
      ORDER BY location_name ASC
      LIMIT $${idx++} OFFSET $${idx++};
    `;
    params.push(limit, offset);

    const res = await this.db.query(sql, params);
    const locations: InvestigationLocation[] = res.rows.map((row) => ({
      locationId: row.location_id,
      name: row.location_name,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      address: row.address,
      city: row.city,
      district: row.district,
      state: row.state,
      country: 'India',
      entityReferences: [],
      caseIds: [],
      timelineEventIds: [],
      sourceDataset: 'locations',
      sourceRecordId: row.location_id,
      metadata: {
        locationType: row.location_type,
        area: row.area,
        pincode: row.pincode,
        sensitivityLevel: row.sensitivity_level,
      },
    }));

    return { data: locations, total };
  }

  async getLocationById(id: string): Promise<InvestigationLocation | null> {
    const res = await this.db.query(
      `SELECT * FROM locations WHERE location_id = $1 LIMIT 1;`,
      [id],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    // Fetch entity sightings at this location from location_events
    const evRes = await this.db.query(
      `SELECT entity_id, entity_type, timestamp, event_id
       FROM location_events
       WHERE location_id = $1
       ORDER BY timestamp DESC
       LIMIT 20;`,
      [id],
    );

    const entityReferences: EntityReference[] = evRes.rows.map((e) => ({
      entityId: e.entity_id,
      entityType: e.entity_type as any,
      label: `Sighting: ${e.entity_id}`,
    }));

    const timelineEventIds = evRes.rows.map((e) => `TL-LOC-${e.event_id}`);

    return {
      locationId: row.location_id,
      name: row.location_name,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      address: row.address,
      city: row.city,
      district: row.district,
      state: row.state,
      country: 'India',
      entityReferences,
      caseIds: [],
      timelineEventIds,
      firstObserved: evRes.rows[evRes.rows.length - 1]?.timestamp,
      lastObserved: evRes.rows[0]?.timestamp,
      sourceDataset: 'locations',
      sourceRecordId: row.location_id,
      metadata: row,
    };
  }
}
