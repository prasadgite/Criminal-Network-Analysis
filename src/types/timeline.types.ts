export type TimelineEventType =
  | "cdr"
  | "transaction"
  | "location"
  | "case"
  | "evidence"
  | "relationship"
  | "system";

export type TimelineEventSource = TimelineEventType;

export interface TimelineEvent {
  eventId: string;

  eventType: TimelineEventType;

  /** Preserved alias for source */
  source?: TimelineEventSource;

  timestamp: string;

  title: string;

  description?: string;

  sourceRecordId: string;

  entityIds?: string[];

  caseId?: string;
  caseIds?: string[];

  locationId?: string;

  confidence?: number;

  metadata?: Record<string, unknown>;
}
