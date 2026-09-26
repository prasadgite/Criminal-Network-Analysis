/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #14
 *
 * Entity Model
 *
 * This is the canonical investigation-level entity abstraction.
 *
 * IMPORTANT:
 * This does NOT replace src/types/entity.types.ts.
 * It is intentionally isolated so the existing application remains stable.
 */

export type InvestigationEntityType =
  | "person"
  | "phone"
  | "vehicle"
  | "bank_account"
  | "location"
  | "case"
  | "document"
  | "evidence"
  | "organization"
  | "unknown";

export type InvestigationEntityStatus =
  | "active"
  | "inactive"
  | "unknown";

export interface EntityBase {
  /**
   * Stable investigation-level identity.
   *
   * This is NOT necessarily the same as a source dataset ID.
   */
  entityId: string;

  /**
   * Canonical entity category.
   */
  entityType: InvestigationEntityType;

  /**
   * Human-readable investigator-facing name.
   */
  displayName: string;

  /**
   * Optional lifecycle/status information.
   */
  status?: InvestigationEntityStatus;
}

/**
 * Lightweight entity reference.
 *
 * Used by Cases, Relationships, Timeline events,
 * Locations, Evidence and Findings without embedding
 * the complete entity object.
 */
export interface EntityReference {
  entityId: string;
  entityType: InvestigationEntityType;
  label: string;
}

/**
 * Optional provenance information.
 *
 * Allows an investigation entity to retain knowledge
 * of where the identity originated.
 */
export interface EntitySourceReference {
  sourceDataset: string;
  sourceRecordId: string;
}

/**
 * Canonical investigation entity.
 *
 * EntityBase is deliberately kept small.
 * Additional source/provenance information is optional.
 */
export interface InvestigationEntity extends EntityBase {
  sourceReferences?: EntitySourceReference[];
}
