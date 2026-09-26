export type CaseStatus =
  | "open"
  | "closed"
  | "pending"
  | "active"
  | "under_review"
  | "archived"
  | "unknown";

export type CaseSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export interface Case {
  caseId: string;

  firNumber?: string;

  caseType?: string;

  crimeCategory?: string;
  crimeSubcategory?: string;

  ipcSection?: string;

  registrationDate?: string;
  incidentDate?: string;
  incidentTime?: string;

  policeStationId?: string;

  district?: string;
  city?: string;
  state?: string;

  latitude?: number;
  longitude?: number;

  caseStatus?: CaseStatus;
  severity?: CaseSeverity;

  investigatingOfficerId?: string;

  source?: string;

  description?: string;
}
