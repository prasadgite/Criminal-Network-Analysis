export type UserRole =
  | "investigator"
  | "supervisor"
  | "analyst"
  | "administrator"
  | "CYBER_CELL_ADMIN"
  | "cyber_cell_admin"
  | "SENIOR_INVESTIGATOR"
  | "INVESTIGATOR"
  | "ANALYST"
  | "AUDITOR";

export interface AuthenticatedUser {
  userId: string;
  displayName: string;
  email?: string;
  role: UserRole | string;
  clearanceLevel?: string;
  permissions: string[];
}

export interface AuthSession {
  accessToken: string;
  user: AuthenticatedUser;
  expiresAt?: string;
}
