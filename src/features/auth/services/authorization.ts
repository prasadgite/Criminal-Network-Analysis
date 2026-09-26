import type { AuthenticatedUser } from "../types/auth.types";

export function hasPermission(
  user: AuthenticatedUser | null,
  permission: string,
): boolean {
  if (!user) {
    return false;
  }

  return user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: AuthenticatedUser | null,
  permissions: string[],
): boolean {
  if (!user) {
    return false;
  }

  return permissions.some((permission) =>
    user.permissions.includes(permission),
  );
}

export function hasRole(
  user: AuthenticatedUser | null,
  role: AuthenticatedUser["role"],
): boolean {
  return user?.role === role;
}
