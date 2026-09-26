import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { activationService } from "../../services/activationService";
import "./ActivateAccountPage.css";

function passwordChecks(password: string) {
  return {
    length: password.length >= 12,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z\d]/.test(password),
  };
}

export default function ActivateAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [investigatorId, setInvestigatorId] = useState(
    () => searchParams.get("investigatorId") || ""
  );
  const [activationCode, setActivationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checks = useMemo(() => passwordChecks(password), [password]);
  const passwordValid = Object.values(checks).every(Boolean);
  const passwordsMatch = password.length > 0 && password === confirmation;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordValid) {
      setError("Password does not meet the minimum security requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Password confirmation does not match.");
      return;
    }

    setBusy(true);

    try {
      const result = await activationService.activate({
        investigatorId: investigatorId.trim(),
        activationCode: activationCode.trim(),
        newPassword: password,
      });

      setSuccess(result.message);
      window.setTimeout(() => navigate("/login", {
        replace: true,
        state: {
          activatedInvestigatorId: result.investigator.investigator_id,
        },
      }), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account activation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="activation-page">
      <section className="activation-card">
        <header>
          <span className="activation-eyebrow">SANDHAAN / SECURE ACCESS</span>
          <h1>First-Time Account Activation</h1>
          <p>
            Establish the permanent credential for an account approved by the Cyber Cell.
          </p>
        </header>

        {error && <div className="activation-alert activation-alert--error">{error}</div>}
        {success && <div className="activation-alert activation-alert--success">{success}</div>}

        <form onSubmit={submit}>
          <label>
            Investigator ID
            <input
              value={investigatorId}
              onChange={(e) => setInvestigatorId(e.target.value)}
              autoComplete="username"
              placeholder="INV-2026-XXXXXXXX"
              required
            />
          </label>

          <label>
            One-Time Activation Credential
            <input
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              autoComplete="one-time-code"
              placeholder="Enter activation credential"
              required
            />
          </label>

          <label>
            New Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label>
            Confirm New Password
            <input
              type={showPassword ? "text" : "password"}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <div className="password-rules">
            <strong>Password requirements</strong>
            <span className={checks.length ? "pass" : ""}>12+ characters</span>
            <span className={checks.lower ? "pass" : ""}>Lowercase letter</span>
            <span className={checks.upper ? "pass" : ""}>Uppercase letter</span>
            <span className={checks.number ? "pass" : ""}>Number</span>
            <span className={checks.special ? "pass" : ""}>Special character</span>
            <span className={passwordsMatch ? "pass" : ""}>Passwords match</span>
          </div>

          <button
            className="activation-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? "Activating Account..." : "Activate Account"}
          </button>
        </form>

        <footer>
          <Link to="/login">Return to secure login</Link>
          <span>Activation credentials are single-use.</span>
        </footer>
      </section>
    </main>
  );
}
