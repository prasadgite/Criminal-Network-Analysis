import { FC, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/routes/routePaths";
import { accessRequestService } from "../../services/accessRequestService";
import type { AccessRequestPayload } from "../../types/authentication";
import { AuthBrand } from "../../components/AuthBrand";
import { AuthField } from "../../components/AuthField";
import { AuthFooter } from "../../components/AuthFooter";
import "./RequestAccessPage.css";

export const RequestAccessPage: FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<AccessRequestPayload>({
    fullName: "",
    officialId: "",
    officialEmail: "",
    officialPhone: "",
    organization: "",
    department: "",
    designation: "",
    rank: "",
    jurisdiction: "",
    officeUnit: "",
    supervisorName: "",
    supervisorId: "",
    purpose: "",
    authorizationDocument: "",
  });

  const [declarations, setDeclarations] = useState({
    accurate: false,
    auditMonitoring: false,
    revocationAware: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof AccessRequestPayload,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isDeclarationsComplete =
    declarations.accurate &&
    declarations.auditMonitoring &&
    declarations.revocationAware;

  const isFormValid =
    form.fullName.trim() !== "" &&
    form.officialId.trim() !== "" &&
    form.officialEmail.trim() !== "" &&
    form.officialPhone.trim() !== "" &&
    form.organization.trim() !== "" &&
    form.department.trim() !== "" &&
    form.designation.trim() !== "" &&
    form.rank.trim() !== "" &&
    form.jurisdiction.trim() !== "" &&
    form.officeUnit.trim() !== "" &&
    form.supervisorName.trim() !== "" &&
    form.supervisorId.trim() !== "" &&
    form.purpose.trim() !== "" &&
    isDeclarationsComplete;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isDeclarationsComplete) {
      setError("Please confirm all declarations before submitting your application.");
      return;
    }

    if (!form.officialEmail.includes("@")) {
      setError("Please provide a valid official government or agency email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await accessRequestService.submit(form);
      navigate(routes.accessSubmitted, {
        state: {
          applicationNumber: response.applicationNumber,
          submittedAt: response.submittedAt,
          status: response.status,
          applicantName: form.fullName,
          officialId: form.officialId,
          department: form.department,
        },
      });
    } catch {
      setError(
        "Unable to submit official access request. Please verify all fields or contact the Cyber Cell administrator.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="request-access-viewport">
      <div className="login-grid-bg" aria-hidden="true" />

      <section className="request-access-card" aria-labelledby="request-access-heading">
        <AuthBrand
          pillText="OFFICIAL ACCESS APPLICATION"
          subtitle="MANUAL CYBER CELL VERIFICATION GATEWAY"
        />

        <div className="access-intro-banner">
          <span className="access-intro-title">Manual Authorization Notice</span>
          <p className="access-intro-desc">
            Access to SANDHAAN is restricted to authorized law enforcement and intelligence personnel.
            All applications are subjected to manual identity and supervisory clearance by the Cyber Cell
            prior to account creation.
          </p>
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            ! {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-access-form">
          {/* ============================================================
              01 — IDENTITY
              ============================================================ */}
          <div className="form-section-dossier">
            <div className="form-section-heading">
              <span className="form-section-num">01</span>
              <h2 className="form-section-title">Official Identity</h2>
            </div>

            <div className="form-grid-2col">
              <AuthField id="fullName" label="Full Official Name" required>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="e.g. Vikramaditya Rathore"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>

              <AuthField id="officialId" label="Official Service / Badge ID" required>
                <input
                  id="officialId"
                  type="text"
                  value={form.officialId}
                  onChange={(e) => handleChange("officialId", e.target.value)}
                  placeholder="e.g. POL-DL-8941"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>
            </div>

            <div className="form-grid-2col">
              <AuthField id="officialEmail" label="Official Government Email" required tag="GOV.IN / AGENCY">
                <input
                  id="officialEmail"
                  type="email"
                  value={form.officialEmail}
                  onChange={(e) => handleChange("officialEmail", e.target.value)}
                  placeholder="officer@police.gov.in"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>

              <AuthField id="officialPhone" label="Official Contact Number" required>
                <input
                  id="officialPhone"
                  type="tel"
                  value={form.officialPhone}
                  onChange={(e) => handleChange("officialPhone", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>
            </div>
          </div>

          {/* ============================================================
              02 — OFFICIAL AFFILIATION
              ============================================================ */}
          <div className="form-section-dossier">
            <div className="form-section-heading">
              <span className="form-section-num">02</span>
              <h2 className="form-section-title">Official Affiliation</h2>
            </div>

            <div className="form-grid-2col">
              <AuthField id="organization" label="Organization / Agency" required>
                <select
                  id="organization"
                  value={form.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  disabled={loading}
                  required
                  className="form-select-control"
                >
                  <option value="">Select Official Agency</option>
                  <option value="State Police Department">State Police Department</option>
                  <option value="Central Bureau of Investigation (CBI)">Central Bureau of Investigation (CBI)</option>
                  <option value="National Investigation Agency (NIA)">National Investigation Agency (NIA)</option>
                  <option value="Enforcement Directorate (ED)">Enforcement Directorate (ED)</option>
                  <option value="Intelligence Bureau (IB)">Intelligence Bureau (IB)</option>
                  <option value="Narcotics Control Bureau (NCB)">Narcotics Control Bureau (NCB)</option>
                  <option value="Other Law Enforcement">Other Authorized Agency</option>
                </select>
              </AuthField>

              <AuthField id="department" label="Department / Division" required>
                <input
                  id="department"
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="e.g. Special Cell / Cyber Crime Unit"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>
            </div>

            <div className="form-grid-2col">
              <AuthField id="designation" label="Designation" required>
                <input
                  id="designation"
                  type="text"
                  value={form.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  placeholder="e.g. Assistant Commissioner of Police (ACP)"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>

              <AuthField id="rank" label="Rank / Clearance Level" required>
                <select
                  id="rank"
                  value={form.rank}
                  onChange={(e) => handleChange("rank", e.target.value)}
                  disabled={loading}
                  required
                  className="form-select-control"
                >
                  <option value="">Select Official Level</option>
                  <option value="Level 1 - Field Officer">Level 1 - Field Officer / SI</option>
                  <option value="Level 2 - Investigating Officer">Level 2 - Investigating Officer (IO)</option>
                  <option value="Level 3 - Senior Investigator / SP">Level 3 - Senior Investigator / SP</option>
                  <option value="Level 4 - Bureau Chief / DIG">Level 4 - Bureau Chief / DIG / IG</option>
                  <option value="Level 5 - Central Oversight">Level 5 - Central Director / Oversight</option>
                </select>
              </AuthField>
            </div>

            <div className="form-grid-2col">
              <AuthField id="jurisdiction" label="Jurisdictional Scope" required>
                <input
                  id="jurisdiction"
                  type="text"
                  value={form.jurisdiction}
                  onChange={(e) => handleChange("jurisdiction", e.target.value)}
                  placeholder="e.g. NCT of Delhi & Interstate Nexus"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>

              <AuthField id="officeUnit" label="Office / Unit Location" required>
                <input
                  id="officeUnit"
                  type="text"
                  value={form.officeUnit}
                  onChange={(e) => handleChange("officeUnit", e.target.value)}
                  placeholder="e.g. Lodhi Colony Police Complex"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>
            </div>
          </div>

          {/* ============================================================
              03 — AUTHORIZATION
              ============================================================ */}
          <div className="form-section-dossier">
            <div className="form-section-heading">
              <span className="form-section-num">03</span>
              <h2 className="form-section-title">Supervisory Authorization</h2>
            </div>

            <div className="form-grid-2col">
              <AuthField id="supervisorName" label="Supervising Officer Full Name" required>
                <input
                  id="supervisorName"
                  type="text"
                  value={form.supervisorName}
                  onChange={(e) => handleChange("supervisorName", e.target.value)}
                  placeholder="e.g. K. S. Sundaram, IPS"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>

              <AuthField id="supervisorId" label="Supervisor Official ID" required>
                <input
                  id="supervisorId"
                  type="text"
                  value={form.supervisorId}
                  onChange={(e) => handleChange("supervisorId", e.target.value)}
                  placeholder="e.g. IPS-DL-1994"
                  disabled={loading}
                  required
                  className="form-input-control"
                />
              </AuthField>
            </div>

            <div className="document-upload-box">
              <span className="document-upload-title">Authorization Document (Digital Mandate)</span>
              <span className="document-upload-desc">
                Authorization document upload will be securely processed during application submission.
                Physical and digital supervisory letters will be verified against the official department registry.
              </span>
            </div>
          </div>

          {/* ============================================================
              04 — ACCESS PURPOSE
              ============================================================ */}
          <div className="form-section-dossier">
            <div className="form-section-heading">
              <span className="form-section-num">04</span>
              <h2 className="form-section-title">Official Purpose for Access</h2>
            </div>

            <AuthField
              id="purpose"
              label="Investigation Rationale & Operational Requirement"
              required
              tag="DETAILED JUSTIFICATION"
            >
              <textarea
                id="purpose"
                value={form.purpose}
                onChange={(e) => handleChange("purpose", e.target.value)}
                placeholder="Explain the official requirement, active FIRs, or intelligence operations requiring access to the SANDHAAN network..."
                disabled={loading}
                required
                className="form-textarea-control"
              />
            </AuthField>
          </div>

          {/* ============================================================
              05 — DECLARATION
              ============================================================ */}
          <div className="form-section-dossier">
            <div className="form-section-heading">
              <span className="form-section-num">05</span>
              <h2 className="form-section-title">Official Declarations</h2>
            </div>

            <div className="declarations-group">
              <label className="declaration-item">
                <input
                  type="checkbox"
                  checked={declarations.accurate}
                  onChange={(e) =>
                    setDeclarations((prev) => ({ ...prev, accurate: e.target.checked }))
                  }
                  className="declaration-checkbox"
                />
                <span className="declaration-text">
                  I confirm that the information provided is accurate and relates to my active official role.
                </span>
              </label>

              <label className="declaration-item">
                <input
                  type="checkbox"
                  checked={declarations.auditMonitoring}
                  onChange={(e) =>
                    setDeclarations((prev) => ({
                      ...prev,
                      auditMonitoring: e.target.checked,
                    }))
                  }
                  className="declaration-checkbox"
                />
                <span className="declaration-text">
                  I understand that SANDHAAN access is subject to authorization, strict operational secrecy,
                  and continuous security audit monitoring.
                </span>
              </label>

              <label className="declaration-item">
                <input
                  type="checkbox"
                  checked={declarations.revocationAware}
                  onChange={(e) =>
                    setDeclarations((prev) => ({
                      ...prev,
                      revocationAware: e.target.checked,
                    }))
                  }
                  className="declaration-checkbox"
                />
                <span className="declaration-text">
                  I understand that access may be suspended or revoked following periodic supervisory review.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="form-submit-bar">
            <button
              type="submit"
              id="submit-access-request-btn"
              disabled={loading || !isFormValid}
              className="btn-submit-application"
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  <span>SUBMITTING APPLICATION...</span>
                </>
              ) : (
                <span>SUBMIT OFFICIAL ACCESS REQUEST →</span>
              )}
            </button>
          </div>
        </form>

        <AuthFooter current="request-access" />
      </section>
    </main>
  );
};

export default RequestAccessPage;
