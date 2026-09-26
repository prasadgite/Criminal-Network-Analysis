export type EntityType =
  | "person"
  | "phone"
  | "vehicle"
  | "bank_account"
  | "location";

export interface EntityReference {
  entityId: string;
  entityType: EntityType;
  label: string;
}

export interface EntityBase {
  entityId: string;
  entityType: EntityType;
  label: string;
}
