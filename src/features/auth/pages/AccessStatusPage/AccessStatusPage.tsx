import { FC, useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { accessRequestService } from "../../services/accessRequestService";
import type { AccessRequestStatusResponse } from "../../types/authentication";
import { AuthBrand } from "../../components/AuthBrand";
import { AuthField } from "../../components/AuthField";
import { AuthFooter } from "../../components/AuthFooter";
import "./AccessStatusPage.css";

export const AccessStatusPage: FC = () => {
  const [searchParams] = useSearchParams();
  const initialApp = searchParams.get("app") || "";

  const [applicationNumber, setApplicationNumber] = useState(initialApp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusResult, setStatusResult] =
    useState<AccessRequestStatusResponse | null>(null);

  const fetchStatus = async (appNum: string) => {
    if (!appNum.trim()) {
      setError("Please enter a valid application number (e.g. SAR-2026-000184).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await accessRequestService.getStatus(appNum);
      setStatusResult(res);
    } catch {
      setError(
        "Application record not found. Please verify the application number or contact your supervising Cyber Cell desk.",
      );
      setStatusResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialApp) {
      void fetchStatus(initialApp);
    }
  }, [initialApp]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void fetchStatus(applicationNumber);
  };

  const getTimelineSteps = (status: string) => {
    const isSubmitted = true;
    const isUnderReview =
      status === "UNDER_REVIEW" ||
      status === "APPROVED" ||
      status === "REJECTED" ||
      status === "MORE_INFORMATION_REQUIRED";
    const isDecision = status === "APPROVED" || status === "REJECTED";
    const isApproved = status === "APPROVED";

    return [
      {
        label: "Application Ingested",
        sub: "Logged in national security registry",
        status: isSubmitted ? "completed" : "pending",
        icon: "✓",
      },
      {
        label: "Cyber Cell Verification",
        sub:
          status === "PENDING"
            ? "Awaiting officer assignment"
            : status === "UNDER_REVIEW"
            ? "Actively under identity review"
            : "Verification process completed",
        status: isUnderReview ? (isDecision ? "completed" : "active") : status === "PENDING" ? "active" : "pending",
        icon: isDecision ? "✓" : "●",
      },
      {
        label: "Supervisory Decision",
        sub:
          status === "APPROVED"
            ? "Access authorized & provisioned"
            : status === "REJECTED"
            ? "Access authorization denied"
            : status === "MORE_INFORMATION_REQUIRED"
            ? "Additional documents requested"
            : "Pending final review",
        status: isDecision
          ? "completed"
          : status === "MORE_INFORMATION_REQUIRED"
          ? "active"
          : "pending",
        icon: isDecision ? (isApproved ? "✓" : "✕") : "○",
      },
      {
        label: "Account Activation & Onboarding",
        sub: isApproved
          ? "Activation token dispatched to official email"
          : "Locked until Cyber Cell approval",
        status: isApproved ? "active" : "pending",
        icon: isApproved ? "●" : "○",
      },
    ];
  };

  return (
    <main className="status-viewport">
      <div className="login-grid-bg" aria-hidden="true" />

      <section className="status-card" aria-labelledby="status-heading">
        <AuthBrand
          pillText="APPLICATION STATUS QUERY"
          subtitle="OFFICIAL ACCESS VERIFICATION TRACKER"
        />

        <form onSubmit={handleSearch} className="status-search-form">
          <AuthField id="applicationNumber" label="Enter Application Number" required tag="OFFICIAL SAR CODE">
            <div className="status-input-row">
              <input
                id="applicationNumber"
                type="text"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
                placeholder="e.g. SAR-2026-000184"
                disabled={loading}
                required
                className="status-search-input"
              />
              <button
                type="submit"
                id="submit-status-query-btn"
                disabled={loading || !applicationNumber.trim()}
                className="btn-search-status"
              >
                {loading ? "SEARCHING..." : "CHECK STATUS →"}
              </button>
            </div>
          </AuthField>
        </form>

        {error && (
          <div className="login-error-alert" role="alert">
            <span className="login-error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {statusResult && (
          <div className="status-result-dossier">
            <div className="status-dossier-top">
              <div>
                <span style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  Official Record
                </span>
                <div className="status-app-badge">{statusResult.applicationNumber}</div>
              </div>

              <div
                className={`status-state-pill ${
                  statusResult.status === "APPROVED"
                    ? "approved"
                    : statusResult.status === "REJECTED"
                    ? "rejected"
                    : statusResult.status === "UNDER_REVIEW"
                    ? "review"
                    : statusResult.status === "MORE_INFORMATION_REQUIRED"
                    ? "info"
                    : "pending"
                }`}
              >
                ● {statusResult.status.replace(/_/g, " ")}
              </div>
            </div>

            {/* Dynamic Status Narrative */}
            {statusResult.status === "PENDING" && (
              <div className="status-msg-box">
                <strong>Application Status: PENDING CYBER CELL REVIEW</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  Your application has been received and is currently in the verification queue.
                  Manual verification is conducted by the Cyber Cell in accordance with official clearance procedures.
                </p>
              </div>
            )}

            {statusResult.status === "UNDER_REVIEW" && (
              <div className="status-msg-box">
                <strong>Application Status: UNDER REVIEW</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  Your application is actively being verified against your department registry and supervisory clearance records.
                </p>
              </div>
            )}

            {statusResult.status === "APPROVED" && (
              <div className="status-msg-box approved">
                <strong>✓ ACCESS AUTHORIZED &amp; PROVISIONED</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  Your official access request has been approved. Initial account activation instructions
                  have been communicated through authorized department channels.
                </p>
              </div>
            )}

            {statusResult.status === "REJECTED" && (
              <div className="status-msg-box rejected">
                <strong>ACCESS REQUEST NOT APPROVED</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  Your application could not be verified or authorized by the Cyber Cell desk.
                  {statusResult.reviewNotes && ` Details: ${statusResult.reviewNotes}`}
                </p>
              </div>
            )}

            {statusResult.status === "MORE_INFORMATION_REQUIRED" && (
              <div className="status-msg-box">
                <strong style={{ color: "var(--color-warning)" }}>ACTION REQUIRED: ADDITIONAL INFORMATION NEEDED</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  The reviewing officer has requested supplemental documentation.
                  {statusResult.reviewNotes && ` Instructions: ${statusResult.reviewNotes}`}
                </p>
              </div>
            )}

            {/* Tactical Timeline */}
            <div className="status-timeline-container" aria-label="Application Progress Timeline">
              {getTimelineSteps(statusResult.status).map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.status}`}>
                  <div className="timeline-step-indicator">{step.icon}</div>
                  <div className="timeline-step-content">
                    <span className="timeline-step-label">{step.label}</span>
                    <span className="timeline-step-sub">{step.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AuthFooter current="access-status" />
      </section>
    </main>
  );
};

export default AccessStatusPage;
