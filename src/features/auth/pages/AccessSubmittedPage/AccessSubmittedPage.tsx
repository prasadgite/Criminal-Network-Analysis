import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { routes } from "@/routes/routePaths";
import { AuthBrand } from "../../components/AuthBrand";
import { SecurityNotice } from "../../components/SecurityNotice";
import "./AccessSubmittedPage.css";

interface LocationState {
  applicationNumber?: string;
  submittedAt?: string;
  status?: string;
  applicantName?: string;
  officialId?: string;
}

export const AccessSubmittedPage: FC = () => {
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const appNumber = state.applicationNumber || "SAR-2026-PENDING";
  const submittedDate = state.submittedAt
    ? new Date(state.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <main className="submitted-viewport">
      <div className="login-grid-bg" aria-hidden="true" />

      <section className="submitted-card" aria-labelledby="submitted-heading">
        <AuthBrand
          pillText="OFFICIAL ACCESS APPLICATION"
          subtitle="APPLICATION CONFIRMATION DOCKET"
        />

        <div className="submitted-status-icon">✓</div>

        <h1 id="submitted-heading" className="submitted-heading">
          Application Received
        </h1>

        <p className="submitted-info-note">
          Your official access application has been securely transmitted and logged in the
          SANDHAAN central access registry. It must be manually reviewed and verified by the
          authorized Cyber Cell before an account can be provisioned.
        </p>

        <div className="submitted-dossier-box">
          <div className="submitted-dossier-row">
            <span className="submitted-row-label">Application Number</span>
            <span className="submitted-app-id">{appNumber}</span>
          </div>

          <div className="submitted-dossier-row">
            <span className="submitted-row-label">Current Verification Status</span>
            <div className="submitted-status-badge">
              <span>● PENDING CYBER CELL REVIEW</span>
            </div>
          </div>

          <div className="submitted-dossier-row">
            <span className="submitted-row-label">Timestamp of Ingestion</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              {submittedDate}
            </span>
          </div>

          {state.applicantName && (
            <div className="submitted-dossier-row">
              <span className="submitted-row-label">Applicant Official</span>
              <span style={{ fontSize: "12.5px", color: "#ffffff" }}>
                {state.applicantName} ({state.officialId})
              </span>
            </div>
          )}
        </div>

        <div className="submitted-actions-group">
          <Link
            to={`${routes.accessStatus}?app=${encodeURIComponent(appNumber)}`}
            className="btn-check-status-action"
            id="view-status-btn"
          >
            CHECK APPLICATION STATUS →
          </Link>

          <Link to={routes.home} className="btn-return-portal-action">
            RETURN TO PORTAL OVERVIEW
          </Link>
        </div>

        <footer style={{ borderTop: "1px solid var(--color-border)", paddingTop: "14px" }}>
          <SecurityNotice />
        </footer>
      </section>
    </main>
  );
};

export default AccessSubmittedPage;
