import type { AuthSession } from "../types/auth.types";

const STORAGE_KEY = "sandhaan.auth.session";

export function getStoredSession(): AuthSession | null {
  const rawSession = localStorage.getItem(STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;

    // Check basic structure validity
    if (!session || typeof session !== "object" || !session.accessToken || !session.user) {
      clearStoredSession();
      return null;
    }

    // Check session expiration if expiresAt is present
    if (session.expiresAt) {
      const expirationDate = new Date(session.expiresAt);
      if (Number.isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        clearStoredSession();
        return null;
      }
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
