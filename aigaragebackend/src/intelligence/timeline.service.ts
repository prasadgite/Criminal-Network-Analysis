import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityReference } from './entities.service';

export interface TimelineEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  title: string;
  description?: string;
  entityReferences: EntityReference[];
  caseId?: string;
  locationId?: string;
  sourceDataset?: string;
  sourceRecordId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(private readonly db: DatabaseService) {}

  async getTimeline(
    caseId?: string,
    entityId?: string,
    eventType?: string,
    limit: number = 50,
  ): Promise<{ data: TimelineEvent[]; total: number }> {
    const events: TimelineEvent[] = [];

    // 1. CDR Communications
    if (!eventType || eventType === 'communication') {
      const cdrQuery = entityId
        ? `SELECT cdr_id, caller_phone_id, receiver_phone_id, timestamp, duration_seconds, call_type, location_id
           FROM cdr_records
           WHERE caller_phone_id = $1 OR receiver_phone_id = $1
           ORDER BY timestamp DESC
           LIMIT $2;`
        : `SELECT cdr_id, caller_phone_id, receiver_phone_id, timestamp, duration_seconds, call_type, location_id
           FROM cdr_records
           ORDER BY timestamp DESC
           LIMIT $1;`;

      const params = entityId ? [entityId, limit] : [limit];
      const cdrRes = await this.db.query(cdrQuery, params);

      for (const row of cdrRes.rows) {
        events.push({
          eventId: `TL-CDR-${row.cdr_id}`,
          eventType: 'communication',
          timestamp: row.timestamp,
          title: `Phone Call: ${row.caller_phone_id} → ${row.receiver_phone_id}`,
          description: `${row.call_type || 'Voice'} call lasting ${row.duration_seconds} seconds`,
          entityReferences: [
            { entityId: row.caller_phone_id, entityType: 'phone', label: row.caller_phone_id },
            { entityId: row.receiver_phone_id, entityType: 'phone', label: row.receiver_phone_id },
          ],
          locationId: row.location_id,
          sourceDataset: 'cdr_records',
          sourceRecordId: row.cdr_id,
          metadata: { durationSeconds: row.duration_seconds, callType: row.call_type },
        });
      }
    }

    // 2. Financial Transactions
    if (!eventType || eventType === 'transaction') {
      const txQuery = entityId
        ? `SELECT transaction_id, sender_account_id, receiver_account_id, amount, currency, timestamp, transaction_type, location_id
           FROM transactions
           WHERE sender_account_id = $1 OR receiver_account_id = $1
           ORDER BY timestamp DESC
           LIMIT $2;`
        : `SELECT transaction_id, sender_account_id, receiver_account_id, amount, currency, timestamp, transaction_type, location_id
           FROM transactions
           ORDER BY timestamp DESC
           LIMIT $1;`;

      const params = entityId ? [entityId, limit] : [limit];
      const txRes = await this.db.query(txQuery, params);

      for (const row of txRes.rows) {
        events.push({
          eventId: `TL-TXN-${row.transaction_id}`,
          eventType: 'transaction',
          timestamp: row.timestamp,
          title: `Transfer: ₹${parseFloat(row.amount).toLocaleString('en-IN')}`,
          description: `${row.transaction_type} from ${row.sender_account_id} to ${row.receiver_account_id}`,
          entityReferences: [
            { entityId: row.sender_account_id, entityType: 'bank_account', label: row.sender_account_id },
            { entityId: row.receiver_account_id, entityType: 'bank_account', label: row.receiver_account_id },
          ],
          locationId: row.location_id,
          sourceDataset: 'transactions',
          sourceRecordId: row.transaction_id,
          metadata: { amount: parseFloat(row.amount), currency: row.currency },
        });
      }
    }

    // 3. Location Events
    if (!eventType || eventType === 'location_event') {
      const locEvQuery = entityId
        ? `SELECT event_id, entity_type, entity_id, location_id, timestamp, event_type, source, confidence
           FROM location_events
           WHERE entity_id = $1
           ORDER BY timestamp DESC
           LIMIT $2;`
        : `SELECT event_id, entity_type, entity_id, location_id, timestamp, event_type, source, confidence
           FROM location_events
           ORDER BY timestamp DESC
           LIMIT $1;`;

      const params = entityId ? [entityId, limit] : [limit];
      const locEvRes = await this.db.query(locEvQuery, params);

      for (const row of locEvRes.rows) {
        events.push({
          eventId: `TL-LOC-${row.event_id}`,
          eventType: 'location_event',
          timestamp: row.timestamp,
          title: `Location Sighting: ${row.entity_id}`,
          description: `Identified at location ${row.location_id} via ${row.source || 'sensor'}`,
          entityReferences: [
            { entityId: row.entity_id, entityType: row.entity_type as any, label: row.entity_id },
          ],
          locationId: row.location_id,
          sourceDataset: 'location_events',
          sourceRecordId: row.event_id,
          metadata: { confidence: row.confidence, source: row.source },
        });
      }
    }

    // Sort chronologically descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      data: events.slice(0, limit),
      total: events.length,
    };
  }
}
