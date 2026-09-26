import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/hooks";
import { hasPermission } from "@/features/auth/services/authorization";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}

export default function PermissionGuard({
  permission,
  children,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    return (
      <div style={{ padding: "2rem", color: "#dce8f6" }}>
        <h1>Access Restricted</h1>
        <p>You do not have permission to access this resource.</p>
      </div>
    );
  }

  return <>{children}</>;
}
