import { FC } from "react";
import { Link } from "react-router-dom";
import { routes } from "@/routes/routePaths";

interface AuthBrandProps {
  subtitle?: string;
  pillText?: string;
}

export const AuthBrand: FC<AuthBrandProps> = ({
  subtitle = "CRIMINAL NETWORK INTELLIGENCE PLATFORM",
  pillText = "SECURE INVESTIGATOR ACCESS",
}) => {
  return (
    <header className="auth-card-header">
      <div className="auth-classification-pill">
        <span>● {pillText}</span>
      </div>

      <Link to={routes.home} className="auth-brand-group" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="auth-emblem">SD</div>
        <div className="auth-title-text">
          <h1 className="auth-title-h1">SANDHAAN</h1>
          <span className="auth-terminal-sub">{subtitle}</span>
        </div>
      </Link>
    </header>
  );
};
