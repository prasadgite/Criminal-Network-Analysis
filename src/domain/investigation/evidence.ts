/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #19
 *
 * Evidence represents source material or investigative artifacts
 * that can support findings within an investigation.
 */

import type { EntityReference } from "./entity";

export type EvidenceType =
  | "document"
  | "image"
  | "video"
  | "audio"
  | "call_record"
  | "transaction_record"
  | "location_record"
  | "vehicle_record"
  | "digital_record"
  | "physical_evidence"
  | "statement"
  | "other";

export type EvidenceStatus =
  | "collected"
  | "verified"
  | "under_review"
  | "disputed"
  | "archived";

export type EvidenceReliability =
  | "low"
  | "medium"
  | "high"
  | "unknown";

export interface InvestigationEvidence {
  evidenceId: string;

  evidenceType: EvidenceType;

  title: string;

  description?: string;

  status: EvidenceStatus;

  reliability: EvidenceReliability;

  caseId?: string;

  entityReferences: EntityReference[];

  timelineEventIds: string[];

  locationId?: string;

  findingIds: string[];

  sourceDataset?: string;

  sourceRecordId?: string;

  collectedAt?: string;

  verifiedAt?: string;

  metadata?: Record<string, unknown>;
}
