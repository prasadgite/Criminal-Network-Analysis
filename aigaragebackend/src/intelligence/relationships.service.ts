import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityReference } from './entities.service';

export interface EntityRelationship {
  relationshipId: string;
  source: EntityReference;
  target: EntityReference;
  relationshipType: string;
  confidence: number;
  sourceDataset?: string;
  sourceRecordId?: string;
  firstObserved?: string;
  lastObserved?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class RelationshipsService {
  private readonly logger = new Logger(RelationshipsService.name);

  constructor(private readonly db: DatabaseService) {}

  async getRelationships(
    entityId?: string,
    relationshipType?: string,
    limit: number = 50,
  ): Promise<{ data: EntityRelationship[]; total: number }> {
    const relationships: EntityRelationship[] = [];

    // 1. Phone Communications (CDR)
    if (!relationshipType || relationshipType === 'communicates_with') {
      const cdrQuery = entityId
        ? `SELECT cdr_id, caller_phone_id, receiver_phone_id, timestamp, duration_seconds, call_type
           FROM cdr_records
           WHERE caller_phone_id = $1 OR receiver_phone_id = $1
           ORDER BY timestamp DESC
           LIMIT $2;`
        : `SELECT cdr_id, caller_phone_id, receiver_phone_id, timestamp, duration_seconds, call_type
           FROM cdr_records
           ORDER BY timestamp DESC
           LIMIT $1;`;

      const params = entityId ? [entityId, limit] : [limit];
      const cdrRes = await this.db.query(cdrQuery, params);

      for (const row of cdrRes.rows) {
        relationships.push({
          relationshipId: `REL-CDR-${row.cdr_id}`,
          source: {
            entityId: row.caller_phone_id,
            entityType: 'phone',
            label: `Caller (${row.caller_phone_id})`,
          },
          target: {
            entityId: row.receiver_phone_id,
            entityType: 'phone',
            label: `Receiver (${row.receiver_phone_id})`,
          },
          relationshipType: 'communicates_with',
          confidence: 0.95,
          sourceDataset: 'cdr_records',
          sourceRecordId: row.cdr_id,
          firstObserved: row.timestamp,
          lastObserved: row.timestamp,
          metadata: {
            durationSeconds: row.duration_seconds,
            callType: row.call_type,
          },
        });
      }
    }

    // 2. Financial Transactions
    if (!relationshipType || relationshipType === 'transacted_with') {
      const txQuery = entityId
        ? `SELECT transaction_id, sender_account_id, receiver_account_id, amount, currency, timestamp, transaction_type
           FROM transactions
           WHERE sender_account_id = $1 OR receiver_account_id = $1
           ORDER BY timestamp DESC
           LIMIT $2;`
        : `SELECT transaction_id, sender_account_id, receiver_account_id, amount, currency, timestamp, transaction_type
           FROM transactions
           ORDER BY timestamp DESC
           LIMIT $1;`;

      const params = entityId ? [entityId, limit] : [limit];
      const txRes = await this.db.query(txQuery, params);

      for (const row of txRes.rows) {
        relationships.push({
          relationshipId: `REL-TXN-${row.transaction_id}`,
          source: {
            entityId: row.sender_account_id,
            entityType: 'bank_account',
            label: `Sender (${row.sender_account_id})`,
          },
          target: {
            entityId: row.receiver_account_id,
            entityType: 'bank_account',
            label: `Receiver (${row.receiver_account_id})`,
          },
          relationshipType: 'transacted_with',
          confidence: 0.98,
          sourceDataset: 'transactions',
          sourceRecordId: row.transaction_id,
          firstObserved: row.timestamp,
          lastObserved: row.timestamp,
          metadata: {
            amount: parseFloat(row.amount),
            currency: row.currency,
            transactionType: row.transaction_type,
          },
        });
      }
    }

    // 3. Ownership / Registrations (Phones -> Person, Vehicles -> Person, Accounts -> Person)
    if (!relationshipType || relationshipType === 'registered_to' || relationshipType === 'owns') {
      const phoneOwnQuery = entityId
        ? `SELECT phone_id, phone_number, registered_person_id, activation_date FROM phones WHERE registered_person_id IS NOT NULL AND (phone_id = $1 OR registered_person_id = $1) LIMIT $2;`
        : `SELECT phone_id, phone_number, registered_person_id, activation_date FROM phones WHERE registered_person_id IS NOT NULL LIMIT $1;`;
      const phoneParams = entityId ? [entityId, limit] : [limit];
      const phoneOwnRes = await this.db.query(phoneOwnQuery, phoneParams);

      for (const row of phoneOwnRes.rows) {
        relationships.push({
          relationshipId: `REL-REG-PH-${row.phone_id}`,
          source: {
            entityId: row.phone_id,
            entityType: 'phone',
            label: row.phone_number,
          },
          target: {
            entityId: row.registered_person_id,
            entityType: 'person',
            label: `Subscriber (${row.registered_person_id})`,
          },
          relationshipType: 'registered_to',
          confidence: 0.99,
          sourceDataset: 'phones',
          sourceRecordId: row.phone_id,
          firstObserved: row.activation_date,
        });
      }
    }

    return {
      data: relationships.slice(0, limit),
      total: relationships.length,
    };
  }

  async getNetworkGraph(
    rootEntityId: string,
    depth: number = 2,
  ): Promise<{ nodes: any[]; edges: any[] }> {
    const nodes = new Map<string, any>();
    const edges: any[] = [];

    // Get direct communications
    const cdrRes = await this.db.query(
      `SELECT caller_phone_id, receiver_phone_id, COUNT(*) as call_count, SUM(duration_seconds) as total_duration
       FROM cdr_records
       WHERE caller_phone_id = $1 OR receiver_phone_id = $1
       GROUP BY caller_phone_id, receiver_phone_id
       LIMIT 50;`,
      [rootEntityId],
    );

    nodes.set(rootEntityId, {
      id: rootEntityId,
      label: rootEntityId,
      type: 'phone',
      isRoot: true,
    });

    for (const row of cdrRes.rows) {
      const otherId = row.caller_phone_id === rootEntityId ? row.receiver_phone_id : row.caller_phone_id;
      if (!nodes.has(otherId)) {
        nodes.set(otherId, {
          id: otherId,
          label: otherId,
          type: 'phone',
        });
      }
      edges.push({
        id: `EDGE-${row.caller_phone_id}-${row.receiver_phone_id}`,
        source: row.caller_phone_id,
        target: row.receiver_phone_id,
        type: 'communicates_with',
        weight: parseInt(row.call_count, 10),
        metadata: {
          calls: parseInt(row.call_count, 10),
          durationSeconds: parseInt(row.total_duration, 10),
        },
      });
    }

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }
}
