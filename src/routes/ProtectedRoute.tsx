import type { ReactNode } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "@/features/auth/hooks";
import { hasPermission, type Permission } from "@/features/auth/authorization";
import { routes } from "./routePaths";

export interface ProtectedRouteProps {
  requiredRoles?: string[];
  permission?: Permission;
  children?: ReactNode;
}

export default function ProtectedRoute({ requiredRoles, permission, children }: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", color: "#dce8f6", backgroundColor: "#060b13", minHeight: "100vh" }}>
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${routes.login}?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // Check required permission if specified
  if (permission && !hasPermission(user?.role, permission)) {
    return (
      <Navigate
        to={routes.forbidden}
        replace
        state={{
          requiredPermission: permission,
          from: location,
        }}
      />
    );
  }

  // Check required roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = (user?.role || '').toUpperCase();
    const isAuthorized = requiredRoles.some(
      (role) => role.toUpperCase() === userRole,
    );

    if (!isAuthorized) {
      return (
        <Navigate
          to={routes.forbidden}
          replace
          state={{
            requiredRoles: requiredRoles.join(", "),
            from: location,
          }}
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
