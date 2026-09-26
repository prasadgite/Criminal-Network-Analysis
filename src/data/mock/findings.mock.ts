import type { Finding } from "@/types";

export const mockFindings: Finding[] = [
  {
    findingId: "FIND-15001",
    title: "Repeated communication association",
    description:
      "Multiple communication events connect entities associated with the investigation.",
    severity: "high",
    confidence: 0.89,
    caseId: "CASE-2026-001",
    entityIds: [
      "P-1001",
      "P-1002",
    ],
    evidenceIds: [
      "EVD-13001",
    ],
    methodology:
      "Communication pattern analysis",
    createdAt: "2026-09-16T09:00:00+05:30",
    createdBy: "SANDHAAN_ANALYTICS",
  },
];
