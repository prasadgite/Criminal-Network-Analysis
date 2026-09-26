/**
 * SANDHAAN — Investigation Domain
 *
 * Phase 3 & 4 Investigation Intelligence Layer.
 * Canonical primitives and live NeonDB-backed domain services.
 */

// Entity
export {
  type InvestigationEntityType,
  type InvestigationEntityStatus,
  type EntityBase,
  type EntityReference,
  type EntitySourceReference,
  type InvestigationEntity,
} from "./entity";

// Case
export {
  type CaseStatus,
  type CasePriority,
  type InvestigationCase,
} from "./case";

// Relationship
export {
  type RelationshipType,
  type EntityRelationship,
} from "./relationship";

// Timeline
export {
  type TimelineEventType,
  type TimelineEvent,
} from "./timeline";

// Location
export {
  type InvestigationLocation,
} from "./location";

// Evidence
export {
  type EvidenceType,
  type EvidenceStatus,
  type EvidenceReliability,
  type InvestigationEvidence,
} from "./evidence";

// Finding
export {
  type FindingType,
  type FindingSeverity,
  type FindingPriority,
  type FindingStatus,
  type FindingDetectionSource,
  type InvestigationFinding,
} from "./finding";

// Investigation Domain Services (backed by live NeonDB API)
export * from "./services";

// Investigation Context & Navigation
export * from "./context";

