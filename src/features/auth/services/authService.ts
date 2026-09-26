import { apiClient } from "@/services/api/apiClient";
import type { AuthSession, AuthenticatedUser } from "../types/auth.types";

export interface LoginCredentials {
  userId?: string;
  officialId?: string;
  password: string;
}

/**
 * Authentication service communicating directly with SANDHAAN NestJS backend.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const payload = {
    userId: credentials.officialId || credentials.userId,
    officialId: credentials.officialId || credentials.userId,
    password: credentials.password,
  };

  return apiClient.post<AuthSession, typeof payload>(
    "/api/auth/login",
    payload,
  );
}

/**
 * Validates current JWT session against backend /api/auth/me.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return apiClient.get<AuthenticatedUser>("/api/auth/me");
}

export const authService = {
  login,
  getCurrentUser,
};
