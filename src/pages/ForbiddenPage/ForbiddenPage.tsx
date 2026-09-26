import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks";
import { routes } from "@/routes/routePaths";

export default function ForbiddenPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requiredPermission = (location.state as any)?.requiredPermission;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#060b13",
        color: "#e2e8f0",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          background: "#0a1322",
          border: "1px solid #dc2626",
          borderRadius: "4px",
          padding: "2.25rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "0.25rem 0.6rem",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "0.72rem",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            letterSpacing: "0.08em",
            borderRadius: "2px",
            marginBottom: "1rem",
          }}
        >
          SECURITY ENCLAVE • 403 FORBIDDEN
        </div>

        <h2 style={{ margin: "0 0 0.75rem 0", color: "#f8fafc", fontSize: "1.4rem" }}>
          Insufficient Operational Clearance
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: "1.6", margin: "0 0 1.25rem 0" }}>
          Your current account role (<code>{user?.role || "standard"}</code>) does not possess the required RBAC authorization to access this operational module.
        </p>

        {requiredPermission && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.25)",
              borderRadius: "3px",
              fontSize: "0.82rem",
              color: "#fca5a5",
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: "1.25rem",
            }}
          >
            REQUIRED PERMISSION: <strong>{requiredPermission}</strong>
          </div>
        )}

        <div
          style={{
            padding: "0.85rem",
            background: "#060b13",
            border: "1px solid #1e293b",
            borderRadius: "3px",
            fontSize: "0.78rem",
            color: "#64748b",
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: "1.5rem",
          }}
        >
          INCIDENT LOGGED: User {user?.userId || "ANONYMOUS"} • {new Date().toISOString()}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => navigate(routes.dashboard)}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#0284c7",
              border: "none",
              borderRadius: "3px",
              color: "#ffffff",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            ← RETURN TO DASHBOARD
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "0.75rem 1.25rem",
              background: "transparent",
              border: "1px solid #334155",
              borderRadius: "3px",
              color: "#94a3b8",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
}
