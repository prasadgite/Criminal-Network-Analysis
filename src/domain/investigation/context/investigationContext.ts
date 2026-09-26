/**
 * Investigation Context
 *
 * Defines the shared parameter and identifier contract across all SANDHAAN
 * investigation workspaces (Cases, Entities, Network, Timeline, Locations,
 * Evidence, and Findings).
 */

export interface InvestigationContext {
  caseId?: string;
  entityType?: string;
  entityId?: string;
  findingId?: string;
  evidenceId?: string;
  relationshipId?: string;
  timelineEventId?: string;
  locationId?: string;
}

/**
 * Parses search parameters into a normalized InvestigationContext.
 */
export function parseInvestigationContext(
  params: URLSearchParams,
): InvestigationContext {
  return {
    caseId: params.get("caseId") || undefined,
    entityType: params.get("entityType") || undefined,
    entityId: params.get("entityId") || undefined,
    findingId: params.get("findingId") || params.get("selected") || undefined,
    evidenceId: params.get("evidenceId") || undefined,
    relationshipId: params.get("relationshipId") || undefined,
    timelineEventId: params.get("eventId") || params.get("timelineEventId") || undefined,
    locationId: params.get("locationId") || undefined,
  };
}
