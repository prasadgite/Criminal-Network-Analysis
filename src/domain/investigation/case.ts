/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #15
 *
 * Case Model
 *
 * A Case is an investigative container.
 * It connects investigation activity without embedding
 * complete entity/relationship/timeline objects.
 */

import type { EntityReference } from "./entity";

export type CaseStatus =
  | "open"
  | "active"
  | "under_review"
  | "closed"
  | "archived";

export type CasePriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface InvestigationCase {
  /**
   * Stable investigation-level case identity.
   */
  caseId: string;

  /**
   * Case identifier visible to investigators.
   */
  caseNumber: string;

  /**
   * Human-readable case title.
   */
  title: string;

  /**
   * Current lifecycle state.
   */
  status: CaseStatus;

  /**
   * Investigation priority.
   */
  priority: CasePriority;

  /**
   * Optional case description.
   */
  description?: string;

  /**
   * Entities associated with the case.
   *
   * References are used instead of embedding complete entities.
   */
  entityReferences: EntityReference[];

  /**
   * Relationship IDs associated with this case.
   *
   * The Relationship primitive will be implemented separately.
   */
  relationshipIds: string[];

  /**
   * Timeline event IDs associated with this case.
   *
   * The Timeline primitive will be implemented separately.
   */
  timelineEventIds: string[];

  /**
   * Location IDs relevant to the case.
   *
   * The Location primitive will be implemented separately.
   */
  locationIds: string[];

  /**
   * Evidence IDs attached to the case.
   *
   * The Evidence primitive will be implemented separately.
   */
  evidenceIds: string[];

  /**
   * Finding IDs produced during the investigation.
   *
   * The Finding primitive will be implemented separately.
   */
  findingIds: string[];

  /**
   * Optional source dataset provenance.
   */
  sourceDataset?: string;

  /**
   * Source record identifier when the case originates
   * directly from an imported dataset.
   */
  sourceRecordId?: string;

  /**
   * Case creation timestamp.
   */
  createdAt: string;

  /**
   * Last modification timestamp.
   */
  updatedAt?: string;

  /**
   * Optional closure timestamp.
   */
  closedAt?: string;

  /**
   * Optional case metadata (e.g. crimeCategory, policeStationId, district, incidentDate).
   */
  metadata?: Record<string, any>;
}

