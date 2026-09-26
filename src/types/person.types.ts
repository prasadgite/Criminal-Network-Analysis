import type { EntityBase } from "./entity.types";

export type PersonStatus = "active" | "inactive" | "unknown";

export interface Person {
  personId: string;

  fullName: string;
  aliasName?: string;

  gender?: string;
  dateOfBirth?: string;
  age?: number;

  nationality?: string;
  occupation?: string;

  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;

  email?: string;

  personStatus?: PersonStatus;

  knownSince?: string;

  sourceSystem?: string;

  recordConfidence?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface PersonEntity extends EntityBase {
  entityType: "person";
  personId: string;
  fullName: string;
}
