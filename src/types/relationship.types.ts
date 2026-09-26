export type RelationshipEntityType =
  | "person"
  | "phone"
  | "vehicle"
  | "bank_account"
  | "location"
  | "case"
  | "evidence"
  | "document";

export interface EntityRelationship {
  relationshipId: string;

  sourceEntityId: string;
  sourceEntityType: RelationshipEntityType;

  relationshipType: string;

  targetEntityId: string;
  targetEntityType: RelationshipEntityType;

  startTime?: string;
  endTime?: string;

  confidence?: number;

  sourceDocumentId?: string;

  verified?: boolean;
  verificationStatus?: string;
}
