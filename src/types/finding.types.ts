export type FindingSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "informational"
  | "unknown";

export interface Finding {
  findingId: string;

  title: string;

  description: string;

  severity?: FindingSeverity;

  confidence?: number;

  caseId?: string;
  caseIds?: string[];

  entityIds?: string[];

  evidenceIds?: string[];

  methodology?: string;

  status?: string;

  detectedAt?: string;
  createdAt?: string;
  createdBy?: string;
}
