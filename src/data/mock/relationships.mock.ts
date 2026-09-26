import type { EntityRelationship } from "@/types";

export const mockRelationships: EntityRelationship[] = [
  {
    relationshipId: "REL-9001",
    sourceEntityId: "P-1001",
    sourceEntityType: "person",
    relationshipType: "USES_PHONE",
    targetEntityId: "PH-2001",
    targetEntityType: "phone",
    confidence: 0.98,
    verified: true,
    verificationStatus: "verified",
  },

  {
    relationshipId: "REL-9002",
    sourceEntityId: "P-1002",
    sourceEntityType: "person",
    relationshipType: "USES_PHONE",
    targetEntityId: "PH-2002",
    targetEntityType: "phone",
    confidence: 0.97,
    verified: true,
    verificationStatus: "verified",
  },

  {
    relationshipId: "REL-9003",
    sourceEntityId: "P-1001",
    sourceEntityType: "person",
    relationshipType: "OWNS",
    targetEntityId: "V-3001",
    targetEntityType: "vehicle",
    confidence: 0.99,
    verified: true,
    verificationStatus: "verified",
  },

  {
    relationshipId: "REL-9004",
    sourceEntityId: "P-1001",
    sourceEntityType: "person",
    relationshipType: "HOLDS",
    targetEntityId: "ACC-4001",
    targetEntityType: "bank_account",
    confidence: 0.99,
    verified: true,
    verificationStatus: "verified",
  },
];
