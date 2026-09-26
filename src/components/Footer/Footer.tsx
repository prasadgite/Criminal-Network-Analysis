import "./Footer.css";

export interface FooterProps {
  version?: string;
  environment?: string;
}

export function Footer({
  version = "v0.1.0",
  environment = "DEVELOPMENT",
}: FooterProps) {
  return (
    <footer className="app-footer">
      {/* ────────────────────────────────────────────────────────
          Left — Platform identity
          ──────────────────────────────────────────────────────── */}

      <div className="app-footer__identity">
        <span className="app-footer__brand">
          SANDHAAN
        </span>

        <span className="app-footer__separator">
          /
        </span>

        <span className="app-footer__product">
          Criminal Network Intelligence Platform
        </span>
      </div>

      {/* ────────────────────────────────────────────────────────
          Center — Operational status
          ──────────────────────────────────────────────────────── */}

      <div className="app-footer__status">
        <div
          className="app-footer__status-item"
          title="Application services are operational"
        >
          <span
            className="app-footer__status-dot app-footer__status-dot--online"
            aria-hidden="true"
          />

          <span>SYSTEM OPERATIONAL</span>
        </div>

        <div
          className="app-footer__status-item"
          title="Intelligence data services are available"
        >
          <span
            className="app-footer__status-dot app-footer__status-dot--online"
            aria-hidden="true"
          />

          <span>DATA SERVICES CONNECTED</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          Right — Environment / security / version
          ──────────────────────────────────────────────────────── */}

      <div className="app-footer__meta">
        <span className="app-footer__environment">
          {environment}
        </span>

        <span className="app-footer__classification">
          AUTHORIZED ACCESS
        </span>

        <span className="app-footer__version">
          {version}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
