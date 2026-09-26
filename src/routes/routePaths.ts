/**
 * Centralized application route definitions.
 *
 * IMPORTANT:
 * - Static paths are stored directly.
 * - Dynamic paths are generated through functions.
 * - Components should not hard-code application URLs.
 */

export const routePatterns = {
  caseDetail: "/cases/:caseId",
  caseNetwork: "/cases/:caseId/network",
  caseTimeline: "/cases/:caseId/timeline",
  caseLocations: "/cases/:caseId/locations",
  caseEvidence: "/cases/:caseId/evidence",
  caseFindings: "/cases/:caseId/findings",

  entityDetail: "/entities/:entityId",
  entityTypeDetail: "/entities/:entityType/:entityId",

  networkDetail: "/network/:networkId",
} as const;

export const routes = {
  home: "/",
  login: "/login",
  requestAccess: "/request-access",
  accessSubmitted: "/access-submitted",
  accessStatus: "/access-status",
  activateAccount: "/activate-account",
  forbidden: "/forbidden",
  admin: {
    accessRequests: "/admin/access-requests",
  },
  dashboard: "/dashboard",

  cases: {
    list: "/cases",
    detail: (caseId: string) => `/cases/${caseId}`,
    network: (caseId: string) => `/cases/${caseId}/network`,
    timeline: (caseId: string) => `/cases/${caseId}/timeline`,
    locations: (caseId: string) => `/cases/${caseId}/locations`,
    evidence: (caseId: string) => `/cases/${caseId}/evidence`,
    findings: (caseId: string) => `/cases/${caseId}/findings`,
  },

  entities: {
    list: "/entities",
    detail: (entityId: string) => `/entities/${entityId}`,
  },

  network: {
    list: "/network",
    detail: (networkId: string) => `/network/${networkId}`,
  },

  timeline: {
    list: "/timeline",
  },

  locations: {
    list: "/locations",
  },

  findings: {
    list: "/findings",
  },

  evidence: {
    list: "/evidence",
  },

  datasets: {
    list: "/datasets",
  },

  dataUpload: {
    list: "/data-upload",
  },

  dataQuality: {
    list: "/data-quality",
  },

  entityResolution: {
    list: "/entity-resolution",
  },
} as const;
