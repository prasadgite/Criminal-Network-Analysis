/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #16
 *
 * Relationship Model
 *
 * Relationships are first-class investigation objects.
 * They connect two entities without embedding either entity.
 */

import type { EntityReference } from "./entity";

export type RelationshipType =
  | "associated_with"
  | "communicates_with"
  | "owns"
  | "registered_to"
  | "located_at"
  | "transacted_with"
  | "linked_to_case"
  | "appeared_with"
  | "visited"
  | "connected_to"
  | "unknown";

export interface EntityRelationship {
  /**
   * Stable relationship identity.
   */
  relationshipId: string;

  /**
   * Entity from which the relationship originates.
   */
  source: EntityReference;

  /**
   * Entity toward which the relationship points.
   */
  target: EntityReference;

  /**
   * Semantic meaning of the relationship.
   */
  relationshipType: RelationshipType;

  /**
   * Confidence in the inferred/observed relationship.
   *
   * Expected range: 0–1.
   */
  confidence: number;

  /**
   * Dataset from which this relationship was observed.
   */
  sourceDataset?: string;

  /**
   * Optional source record identifier.
   */
  sourceRecordId?: string;

  /**
   * First known observation.
   */
  firstObserved?: string;

  /**
   * Most recent observation.
   */
  lastObserved?: string;

  /**
   * Optional metadata describing how the
   * relationship was established.
   */
  metadata?: Record<string, unknown>;
}
