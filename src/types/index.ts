/* ── Legacy / UI Types (Preserved for compatibility) ── */

export type NodeType =
  | "person"
  | "phone"
  | "account"
  | "vehicle"
  | "location"
  | "case";

export type IconName =
  | "home"
  | "case"
  | "person"
  | "network"
  | "clock"
  | "pin"
  | "report"
  | "evidence"
  | "database"
  | "upload"
  | "quality"
  | "link"
  | "audit"
  | "users"
  | "settings"
  | "search"
  | "shield"
  | "bell"
  | "mail"
  | "chevron"
  | "folder"
  | "warning"
  | "expand"
  | "download"
  | "plus"
  | "minus"
  | "reset"
  | "arrow"
  | "menu"
  | "close";

/* ── Canonical Domain Model Types ── */

export * from "./entity.types";
export * from "./person.types";
export * from "./phone.types";
export * from "./vehicle.types";
export * from "./bank-account.types";
export * from "./case.types";
export * from "./relationship.types";
export * from "./cdr.types";
export * from "./transaction.types";
export * from "./location.types";
export * from "./cell-tower.types";
export * from "./location-event.types";
export * from "./timeline.types";
export * from "./evidence.types";
export * from "./finding.types";
export * from "./alert.types";
export * from "./investigation.types";
export * from "./network.types";
export * from "./document.types";
export * from "./entity-resolution.types";

