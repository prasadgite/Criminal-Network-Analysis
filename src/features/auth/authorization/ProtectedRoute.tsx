import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission, type Permission } from './permissions';

export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  role?: string;
  permission?: Permission;
  children: ReactNode;
}

export function ProtectedRoute({
  isAuthenticated,
  role,
  permission,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (permission && !hasPermission(role, permission)) {
    return <Navigate to="/forbidden" replace state={{ requiredPermission: permission }} />;
  }
  return <>{children}</>;
}
