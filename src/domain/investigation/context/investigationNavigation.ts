/**
 * Investigation Navigation
 *
 * Centralized, type-safe path generators for the SANDHAAN Criminal Network
 * Intelligence Platform. Eliminates ad-hoc URL construction and ensures
 * consistent deep-linking across investigation modules.
 */

export interface NetworkNavigationOptions {
  entityId?: string;
  relationshipId?: string;
  caseId?: string;
  depth?: number;
}

export interface TimelineNavigationOptions {
  entityId?: string;
  caseId?: string;
  eventId?: string;
  eventType?: string;
}

/**
 * Generates path to Case Investigation Detail workspace.
 */
export function casePath(caseId: string): string {
  return `/cases/${encodeURIComponent(caseId)}`;
}

/**
 * Generates path to Entity Dossier workspace.
 */
export function entityPath(entityType?: string, entityId?: string): string {
  if (!entityId) return "/entities";
  if (entityType && entityType.trim()) {
    return `/entities/${encodeURIComponent(entityType.toLowerCase())}/${encodeURIComponent(entityId)}`;
  }
  return `/entities/${encodeURIComponent(entityId)}`;
}

/**
 * Generates path to Findings workspace.
 */
export function findingPath(findingId?: string, caseId?: string): string {
  const params = new URLSearchParams();
  if (caseId) params.set("caseId", caseId);
  if (findingId) params.set("selected", findingId);
  const qs = params.toString();
  return qs ? `/findings?${qs}` : "/findings";
}

/**
 * Generates path to Evidence workspace.
 */
export function evidencePath(evidenceId?: string, caseId?: string): string {
  const params = new URLSearchParams();
  if (caseId) params.set("caseId", caseId);
  if (evidenceId) params.set("selected", evidenceId);
  const qs = params.toString();
  return qs ? `/evidence?${qs}` : "/evidence";
}

/**
 * Generates path to Network Analysis workspace.
 */
export function networkPath(options?: NetworkNavigationOptions): string {
  if (!options) return "/network";
  const params = new URLSearchParams();
  if (options.entityId) params.set("entityId", options.entityId);
  if (options.relationshipId) params.set("relationshipId", options.relationshipId);
  if (options.caseId) params.set("caseId", options.caseId);
  if (options.depth) params.set("depth", String(options.depth));
  const qs = params.toString();
  return qs ? `/network?${qs}` : "/network";
}

/**
 * Generates path to Timeline workspace.
 */
export function timelinePath(options?: TimelineNavigationOptions): string {
  if (!options) return "/timeline";
  const params = new URLSearchParams();
  if (options.entityId) params.set("entityId", options.entityId);
  if (options.caseId) params.set("caseId", options.caseId);
  if (options.eventId) params.set("eventId", options.eventId);
  if (options.eventType) params.set("eventType", options.eventType);
  const qs = params.toString();
  return qs ? `/timeline?${qs}` : "/timeline";
}

/**
 * Generates path to Location Intelligence workspace.
 */
export function locationPath(locationId?: string, query?: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (locationId) params.set("selected", locationId);
  const qs = params.toString();
  return qs ? `/locations?${qs}` : "/locations";
}
