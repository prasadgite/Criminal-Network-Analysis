/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #20
 *
 * A finding represents an investigative insight derived from
 * evidence, relationships, timeline events, and entities.
 */

import type { EntityReference } from "./entity";

export type FindingType =
  | "suspicious_relationship"
  | "communication_pattern"
  | "financial_pattern"
  | "location_pattern"
  | "behavioral_pattern"
  | "network_pattern"
  | "identity_match"
  | "anomaly"
  | "risk_indicator"
  | "other";

export type FindingSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type FindingPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type FindingStatus =
  | "new"
  | "under_review"
  | "confirmed"
  | "dismissed"
  | "archived";

export type FindingDetectionSource =
  | "rule"
  | "statistical_model"
  | "graph_analysis"
  | "ml_model"
  | "nlp"
  | "manual"
  | "combined";

export interface InvestigationFinding {
  findingId: string;

  findingType: FindingType;

  title: string;

  description: string;

  severity: FindingSeverity;

  priority: FindingPriority;

  status: FindingStatus;

  confidence: number;

  caseId?: string;

  entityReferences: EntityReference[];

  relationshipIds: string[];

  timelineEventIds: string[];

  locationIds: string[];

  supportingEvidenceIds: string[];

  detectionSource: FindingDetectionSource;

  sourceDataset?: string;

  sourceRecordIds?: string[];

  createdAt: string;

  updatedAt?: string;

  metadata?: Record<string, unknown>;
}
