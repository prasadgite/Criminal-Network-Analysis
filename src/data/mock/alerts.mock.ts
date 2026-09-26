import type { IntelligenceAlert } from "@/types";

export const mockAlerts: IntelligenceAlert[] = [
  {
    alertId: "ALERT-16001",
    title: "New high-priority investigative pattern",
    description:
      "A communication pattern has been identified involving entities linked to an active case.",
    severity: "high",
    status: "new",
    caseId: "CASE-2026-001",
    entityIds: [
      "P-1001",
      "P-1002",
    ],
    findingId: "FIND-15001",
    createdAt: "2026-09-16T09:05:00+05:30",
  },
];
