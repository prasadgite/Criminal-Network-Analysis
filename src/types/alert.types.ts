export type AlertSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface IntelligenceAlert {
  alertId: string;

  title: string;
  description?: string;

  severity: AlertSeverity;
  status: AlertStatus;

  caseId?: string;
  caseIds?: string[];

  entityIds?: string[];

  findingId?: string;

  createdAt: string;

  acknowledgedAt?: string;
  resolvedAt?: string;
}
