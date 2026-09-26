import { useState, type FormEvent } from "react";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { authService } from "../../services/authService";
import { routes } from "@/routes/routePaths";
import { AuthBrand } from "../../components/AuthBrand";
import { AuthField } from "../../components/AuthField";
import { SecurityNotice } from "../../components/SecurityNotice";
import "./LoginPage.css";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [officialId, setOfficialId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? routes.dashboard;
    return <Navigate to={from} replace />;
  }

  const fillDevCredentials = () => {
    setOfficialId("INV-2026-081");
    setPassword("Sandhaan@2026");
    setError(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!officialId.trim()) {
      setError("Official identifier is required.");
      return;
    }

    if (!password) {
      setError("Security password is required.");
      return;
    }

    setLoading(true);

    try {
      const session = await authService.login({
        officialId: officialId.trim(),
        password,
      });

      login(session);
      navigate(routes.dashboard);
    } catch (err: any) {
      const code = err?.code || err?.data?.code;
      const targetId = err?.data?.investigatorId || err?.investigatorId || officialId.trim();

      if (code === "ACCOUNT_ACTIVATION_REQUIRED" || err?.message?.includes("activation is required")) {
        navigate(
          `${routes.activateAccount}?investigatorId=${encodeURIComponent(targetId)}`,
        );
        return;
      }

      setError(
        err?.message ||
          "Authentication failed. Verify your credentials or contact the Cyber Cell.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-viewport">
      <div className="login-grid-bg" aria-hidden="true" />

      <section className="login-card" aria-labelledby="login-heading">
        <AuthBrand
          pillText="SECURE INVESTIGATOR ACCESS"
          subtitle="CRIMINAL NETWORK INTELLIGENCE PLATFORM"
        />

        {error && (
          <div className="login-error-alert" role="alert">
            <span className="login-error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <AuthField
            id="officialId"
            label="Official Identifier"
            required
            tag="REQUIRED"
          >
            <input
              id="officialId"
              name="officialId"
              type="text"
              value={officialId}
              onChange={(e) => setOfficialId(e.target.value)}
              autoComplete="username"
              placeholder="e.g. INV-2026-0421"
              disabled={loading}
              required
              className="login-input"
            />
          </AuthField>

          <AuthField
            id="password"
            label="Security Password"
            required
            tag="ENCRYPTED"
          >
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••••••"
              disabled={loading}
              required
              className="login-input"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </AuthField>

          {/* Development Quick-Fill Helper — only available in dev mode */}
          {import.meta.env.DEV && (
            <button
              type="button"
              className="login-dev-pill"
              onClick={fillDevCredentials}
              title="Dev mode: auto-fill test credentials"
            >
              <span>DEV LOGIN: <strong className="dev-fill-tag">INV-2026-081</strong></span>
              <span>[FILL ↵]</span>
            </button>
          )}

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading || !officialId.trim() || !password}
            className="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>AUTHENTICATE &amp; ACCESS →</span>
            )}
          </button>
        </form>

        {/* Official Access Request & Status Check Section */}
        <section className="login-portal-actions" aria-label="Official Access Actions">
          <span className="portal-action-heading">New Official User?</span>
          <Link
            to={routes.requestAccess}
            className="btn-request-access-link"
            id="request-access-cta"
          >
            REQUEST OFFICIAL ACCESS →
          </Link>

          <Link
            to={routes.accessStatus}
            className="btn-check-status-link"
            id="check-status-cta"
          >
            CHECK APPLICATION STATUS
          </Link>
        </section>

        <footer className="auth-card-footer">
          <SecurityNotice />
          <div className="auth-footer-nav-row">
            <Link to={routes.home} className="auth-back-link">
              ← RETURN TO SANDHAAN PORTAL
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
