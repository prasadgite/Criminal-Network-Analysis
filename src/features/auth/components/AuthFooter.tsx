import { FC } from "react";
import { Link } from "react-router-dom";
import { routes } from "@/routes/routePaths";
import { SecurityNotice } from "./SecurityNotice";

interface AuthFooterProps {
  current?: "login" | "request-access" | "access-status";
}

export const AuthFooter: FC<AuthFooterProps> = ({ current }) => {
  return (
    <footer className="auth-card-footer">
      <SecurityNotice />

      <div className="auth-footer-nav-row">
        {current !== "login" && (
          <Link to={routes.login} className="auth-back-link">
            ← RETURN TO LOGIN
          </Link>
        )}

        {current !== "request-access" && (
          <Link to={routes.requestAccess} className="auth-back-link">
            REQUEST OFFICIAL ACCESS →
          </Link>
        )}

        {current !== "access-status" && (
          <Link to={routes.accessStatus} className="auth-back-link">
            CHECK APPLICATION STATUS
          </Link>
        )}

        <Link to={routes.home} className="auth-back-link" style={{ marginLeft: "auto" }}>
          PORTAL OVERVIEW
        </Link>
      </div>
    </footer>
  );
};
