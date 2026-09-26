import type {
  EntityMention,
  FirNarrative,
} from "@/types";

export const mockFirNarratives: FirNarrative[] = [
  {
    documentId: "DOC-11001",
    caseId: "CASE-2026-001",
    documentType: "FIR_NARRATIVE",
    documentDate: "2026-09-10",
    language: "English",
    narrativeText:
      "Synthetic FIR narrative describing interactions between multiple entities.",
    sourceOfficer: "OFF-001",
    documentStatus: "active",
    textQuality: "high",
  },
];

export const mockEntityMentions: EntityMention[] = [
  {
    mentionId: "MENTION-12001",
    documentId: "DOC-11001",
    caseId: "CASE-2026-001",
    textSpan: "Aarav Kulkarni",
    startChar: 48,
    endChar: 63,
    entityType: "person",
    extractedValue: "Aarav Kulkarni",
    resolvedEntityId: "P-1001",
    confidence: 0.96,
    resolutionStatus: "resolved",
  },

  {
    mentionId: "MENTION-12002",
    documentId: "DOC-11001",
    caseId: "CASE-2026-001",
    textSpan: "+91-98XXXX1002",
    startChar: 90,
    endChar: 104,
    entityType: "phone",
    extractedValue: "+91-98XXXX1002",
    resolvedEntityId: "PH-2002",
    confidence: 0.93,
    resolutionStatus: "resolved",
  },
];
