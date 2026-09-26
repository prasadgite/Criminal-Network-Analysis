export type InvestigationView =
  | "overview"
  | "entities"
  | "network"
  | "timeline"
  | "location"
  | "locations"
  | "findings"
  | "evidence";

export interface InvestigationContext {
  investigationId: string;

  caseId?: string;

  primaryEntityId?: string;

  selectedEntityIds: string[];

  selectedRelationshipIds: string[];

  activeView: InvestigationView;

  createdAt?: string;
  startedAt?: string;

  updatedAt: string;
}
