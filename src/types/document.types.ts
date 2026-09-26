export interface EntityMention {
  mentionId: string;

  documentId: string;
  caseId?: string;

  textSpan?: string;

  startChar?: number;
  endChar?: number;

  entityType: string;

  extractedValue: string;

  resolvedEntityId?: string;

  confidence?: number;

  resolutionStatus?: string;
}

export interface FirNarrative {
  documentId: string;

  caseId: string;

  documentType?: string;
  documentDate?: string;

  language?: string;

  narrativeText?: string;

  sourceOfficer?: string;

  documentStatus?: string;

  textQuality?: string;
}
