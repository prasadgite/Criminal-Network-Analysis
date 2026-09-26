export interface Evidence {
  evidenceId: string;

  caseId: string;

  evidenceType?: string;

  fileName?: string;
  filePath?: string;

  source?: string;

  collectedBy?: string;
  collectionTimestamp?: string;

  originalHashSha256?: string;
  currentHashSha256?: string;

  integrityStatus?: string;

  chainOfCustodyId?: string;

  accessLevel?: string;

  createdAt?: string;
}

export interface EvidenceLink {
  evidenceLinkId: string;

  evidenceId: string;
  caseId?: string;

  targetType: string;
  targetId: string;

  relationship?: string;

  confidence?: number;

  source?: string;
  timestamp?: string;

  evidenceType?: string;

  chainOfCustodyId?: string;

  integrityStatus?: string;

  originalHashSha256?: string;
  currentHashSha256?: string;
}
