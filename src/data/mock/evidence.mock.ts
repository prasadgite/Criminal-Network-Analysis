import type {
  Evidence,
  EvidenceLink,
} from "@/types";

export const mockEvidence: Evidence[] = [
  {
    evidenceId: "EVD-13001",
    caseId: "CASE-2026-001",
    evidenceType: "CDR_EXPORT",
    fileName: "cdr_export_001.csv",
    filePath: "/evidence/CASE-2026-001/",
    source: "Telecom Source",
    collectedBy: "OFF-001",
    collectionTimestamp: "2026-09-12T10:00:00+05:30",
    originalHashSha256:
      "synthetic-original-hash-001",
    currentHashSha256:
      "synthetic-original-hash-001",
    integrityStatus: "verified",
    chainOfCustodyId: "COC-001",
    accessLevel: "restricted",
    createdAt: "2026-09-12T10:05:00+05:30",
  },
];

export const mockEvidenceLinks: EvidenceLink[] = [
  {
    evidenceLinkId: "EL-14001",
    evidenceId: "EVD-13001",
    caseId: "CASE-2026-001",
    targetType: "phone",
    targetId: "PH-2001",
    relationship: "REFERENCES",
    confidence: 0.99,
    source: "Investigation",
    timestamp: "2026-09-12T10:10:00+05:30",
    evidenceType: "CDR_EXPORT",
    chainOfCustodyId: "COC-001",
    integrityStatus: "verified",
    originalHashSha256:
      "synthetic-original-hash-001",
    currentHashSha256:
      "synthetic-original-hash-001",
  },
];
