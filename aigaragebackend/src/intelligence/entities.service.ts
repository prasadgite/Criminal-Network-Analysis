import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type InvestigationEntityType =
  | 'person'
  | 'phone'
  | 'vehicle'
  | 'bank_account'
  | 'location'
  | 'case'
  | 'document'
  | 'evidence'
  | 'organization'
  | 'unknown';

export interface EntityReference {
  entityId: string;
  entityType: InvestigationEntityType;
  label: string;
}

export interface InvestigationEntity {
  entityId: string;
  entityType: InvestigationEntityType;
  displayName: string;
  status?: 'active' | 'inactive' | 'unknown';
  sourceReferences?: Array<{
    sourceDataset: string;
    sourceRecordId: string;
  }>;
  attributes?: Record<string, any>;
}

@Injectable()
export class EntitiesService {
  private readonly logger = new Logger(EntitiesService.name);

  constructor(private readonly db: DatabaseService) {}

  async searchEntities(
    query?: string,
    type?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: InvestigationEntity[]; total: number }> {
    const results: InvestigationEntity[] = [];
    const q = query ? `%${query.trim()}%` : null;

    // 1. Search Persons
    if (!type || type === 'person') {
      const personQuery = q
        ? `SELECT person_id, full_name, person_status, city, occupation, record_id 
           FROM persons 
           WHERE full_name ILIKE $1 OR person_id ILIKE $1 OR city ILIKE $1 
           LIMIT $2 OFFSET $3`
        : `SELECT person_id, full_name, person_status, city, occupation, record_id 
           FROM persons 
           LIMIT $1 OFFSET $2`;

      const params = q ? [q, limit, offset] : [limit, offset];
      const res = await this.db.query(personQuery, params);

      for (const row of res.rows) {
        results.push({
          entityId: row.person_id,
          entityType: 'person',
          displayName: row.full_name,
          status: row.person_status === 'Active' || row.person_status === 'Accused' ? 'active' : 'unknown',
          sourceReferences: [
            { sourceDataset: 'persons', sourceRecordId: row.record_id || row.person_id },
          ],
          attributes: {
            city: row.city,
            occupation: row.occupation,
            personStatus: row.person_status,
          },
        });
      }
    }

    // 2. Search Phones
    if (!type || type === 'phone') {
      const phoneQuery = q
        ? `SELECT phone_id, phone_number, carrier, phone_status, registered_person_id 
           FROM phones 
           WHERE phone_number ILIKE $1 OR phone_id ILIKE $1 OR carrier ILIKE $1 
           LIMIT $2 OFFSET $3`
        : `SELECT phone_id, phone_number, carrier, phone_status, registered_person_id 
           FROM phones 
           LIMIT $1 OFFSET $2`;

      const params = q ? [q, limit, offset] : [limit, offset];
      const res = await this.db.query(phoneQuery, params);

      for (const row of res.rows) {
        results.push({
          entityId: row.phone_id,
          entityType: 'phone',
          displayName: row.phone_number,
          status: row.phone_status === 'Active' ? 'active' : 'inactive',
          sourceReferences: [
            { sourceDataset: 'phones', sourceRecordId: row.phone_id },
          ],
          attributes: {
            carrier: row.carrier,
            registeredPersonId: row.registered_person_id,
          },
        });
      }
    }

    // 3. Search Vehicles
    if (!type || type === 'vehicle') {
      const vehicleQuery = q
        ? `SELECT vehicle_id, registration_number, vehicle_type, make, model, status, registered_owner_id 
           FROM vehicles 
           WHERE registration_number ILIKE $1 OR vehicle_id ILIKE $1 OR make ILIKE $1 OR model ILIKE $1 
           LIMIT $2 OFFSET $3`
        : `SELECT vehicle_id, registration_number, vehicle_type, make, model, status, registered_owner_id 
           FROM vehicles 
           LIMIT $1 OFFSET $2`;

      const params = q ? [q, limit, offset] : [limit, offset];
      const res = await this.db.query(vehicleQuery, params);

      for (const row of res.rows) {
        results.push({
          entityId: row.vehicle_id,
          entityType: 'vehicle',
          displayName: `${row.registration_number} (${[row.make, row.model].filter(Boolean).join(' ') || row.vehicle_type})`,
          status: row.status === 'Active' ? 'active' : 'inactive',
          sourceReferences: [
            { sourceDataset: 'vehicles', sourceRecordId: row.vehicle_id },
          ],
          attributes: {
            registrationNumber: row.registration_number,
            vehicleType: row.vehicle_type,
            registeredOwnerId: row.registered_owner_id,
          },
        });
      }
    }

    // 4. Search Bank Accounts
    if (!type || type === 'bank_account') {
      const bankQuery = q
        ? `SELECT account_id, account_number_masked, bank_name, account_status, holder_person_id 
           FROM bank_accounts 
           WHERE account_number_masked ILIKE $1 OR bank_name ILIKE $1 OR account_id ILIKE $1 
           LIMIT $2 OFFSET $3`
        : `SELECT account_id, account_number_masked, bank_name, account_status, holder_person_id 
           FROM bank_accounts 
           LIMIT $1 OFFSET $2`;

      const params = q ? [q, limit, offset] : [limit, offset];
      const res = await this.db.query(bankQuery, params);

      for (const row of res.rows) {
        results.push({
          entityId: row.account_id,
          entityType: 'bank_account',
          displayName: `${row.bank_name} - ${row.account_number_masked}`,
          status: row.account_status === 'Active' ? 'active' : 'inactive',
          sourceReferences: [
            { sourceDataset: 'bank_accounts', sourceRecordId: row.account_id },
          ],
          attributes: {
            bankName: row.bank_name,
            accountNumber: row.account_number_masked,
            holderPersonId: row.holder_person_id,
          },
        });
      }
    }

    // 5. Search Locations
    if (!type || type === 'location') {
      const locQuery = q
        ? `SELECT location_id, location_name, location_type, city, state 
           FROM locations 
           WHERE location_name ILIKE $1 OR city ILIKE $1 OR location_id ILIKE $1 
           LIMIT $2 OFFSET $3`
        : `SELECT location_id, location_name, location_type, city, state 
           FROM locations 
           LIMIT $1 OFFSET $2`;

      const params = q ? [q, limit, offset] : [limit, offset];
      const res = await this.db.query(locQuery, params);

      for (const row of res.rows) {
        results.push({
          entityId: row.location_id,
          entityType: 'location',
          displayName: row.location_name,
          status: 'active',
          sourceReferences: [
            { sourceDataset: 'locations', sourceRecordId: row.location_id },
          ],
          attributes: {
            locationType: row.location_type,
            city: row.city,
            state: row.state,
          },
        });
      }
    }

    return {
      data: results.slice(0, limit),
      total: results.length,
    };
  }

  async getEntityById(
    type: InvestigationEntityType,
    id: string,
  ): Promise<InvestigationEntity | null> {
    switch (type) {
      case 'person': {
        const res = await this.db.query(
          `SELECT * FROM persons WHERE person_id = $1 LIMIT 1;`,
          [id],
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          entityId: row.person_id,
          entityType: 'person',
          displayName: row.full_name,
          status: row.person_status === 'Active' || row.person_status === 'Accused' ? 'active' : 'unknown',
          sourceReferences: [{ sourceDataset: 'persons', sourceRecordId: row.record_id || row.person_id }],
          attributes: row,
        };
      }
      case 'phone': {
        const res = await this.db.query(
          `SELECT * FROM phones WHERE phone_id = $1 LIMIT 1;`,
          [id],
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          entityId: row.phone_id,
          entityType: 'phone',
          displayName: row.phone_number,
          status: row.phone_status === 'Active' ? 'active' : 'inactive',
          sourceReferences: [{ sourceDataset: 'phones', sourceRecordId: row.phone_id }],
          attributes: row,
        };
      }
      case 'vehicle': {
        const res = await this.db.query(
          `SELECT * FROM vehicles WHERE vehicle_id = $1 LIMIT 1;`,
          [id],
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          entityId: row.vehicle_id,
          entityType: 'vehicle',
          displayName: `${row.registration_number} (${[row.make, row.model].filter(Boolean).join(' ')})`,
          status: row.status === 'Active' ? 'active' : 'inactive',
          sourceReferences: [{ sourceDataset: 'vehicles', sourceRecordId: row.vehicle_id }],
          attributes: row,
        };
      }
      case 'bank_account': {
        const res = await this.db.query(
          `SELECT * FROM bank_accounts WHERE account_id = $1 LIMIT 1;`,
          [id],
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          entityId: row.account_id,
          entityType: 'bank_account',
          displayName: `${row.bank_name} - ${row.account_number_masked}`,
          status: row.account_status === 'Active' ? 'active' : 'inactive',
          sourceReferences: [{ sourceDataset: 'bank_accounts', sourceRecordId: row.account_id }],
          attributes: row,
        };
      }
      case 'location': {
        const res = await this.db.query(
          `SELECT * FROM locations WHERE location_id = $1 LIMIT 1;`,
          [id],
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          entityId: row.location_id,
          entityType: 'location',
          displayName: row.location_name,
          status: 'active',
          sourceReferences: [{ sourceDataset: 'locations', sourceRecordId: row.location_id }],
          attributes: row,
        };
      }
      default:
        return null;
    }
  }

  async getEntityCounts(): Promise<Record<string, number>> {
    const counts = await this.db.query(`
      SELECT
        (SELECT COUNT(*) FROM persons) as persons,
        (SELECT COUNT(*) FROM phones) as phones,
        (SELECT COUNT(*) FROM vehicles) as vehicles,
        (SELECT COUNT(*) FROM bank_accounts) as bank_accounts,
        (SELECT COUNT(*) FROM locations) as locations;
    `);
    const r = counts.rows[0];
    return {
      person: parseInt(r.persons, 10),
      phone: parseInt(r.phones, 10),
      vehicle: parseInt(r.vehicles, 10),
      bank_account: parseInt(r.bank_accounts, 10),
      location: parseInt(r.locations, 10),
    };
  }
}
