/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #17
 *
 * Timeline normalizes time-based events from multiple datasets
 * into one investigation-level representation.
 */

import type { EntityReference } from "./entity";

export type TimelineEventType =
  | "case_event"
  | "communication"
  | "location_event"
  | "transaction"
  | "vehicle_movement"
  | "evidence_event"
  | "document_event"
  | "unknown";

export interface TimelineEvent {
  eventId: string;

  eventType: TimelineEventType;

  timestamp: string;

  title: string;

  description?: string;

  entityReferences: EntityReference[];

  caseId?: string;

  locationId?: string;

  sourceDataset?: string;

  sourceRecordId?: string;

  metadata?: Record<string, unknown>;
}
