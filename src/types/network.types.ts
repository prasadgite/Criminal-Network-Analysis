export interface InvestigationNetwork {
  networkId: string;

  name?: string;

  entityIds: string[];

  relationshipIds: string[];

  caseIds?: string[];

  generatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
