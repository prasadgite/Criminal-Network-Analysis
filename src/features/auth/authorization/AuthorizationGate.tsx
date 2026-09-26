import type { ReactNode } from 'react';
import { hasPermission, hasAnyPermission, type Permission } from './permissions';

export interface AuthorizationGateProps {
  role?: string;
  permission?: Permission;
  anyOf?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function AuthorizationGate({
  role,
  permission,
  anyOf,
  fallback = null,
  children,
}: AuthorizationGateProps) {
  const allowed = permission
    ? hasPermission(role, permission)
    : anyOf?.length
    ? hasAnyPermission(role, anyOf)
    : false;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
