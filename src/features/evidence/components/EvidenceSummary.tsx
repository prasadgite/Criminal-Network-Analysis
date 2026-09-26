import type { EvidenceSummaryMetrics } from "../services/evidenceService";

interface EvidenceSummaryProps {
  summary: EvidenceSummaryMetrics;
  loading?: boolean;
}

export default function EvidenceSummary({
  summary,
  loading = false,
}: EvidenceSummaryProps) {
  const integrityPercent = summary.loadedEvidence
    ? Math.round((summary.intactIntegrityCount / summary.loadedEvidence) * 100)
    : 100;

  return (
    <section className="evidence-summary-bar">
      <div className="evidence-stat-card">
        <span className="evidence-stat-label">TOTAL INDEXED IN NEONDB</span>
        <strong className="evidence-stat-value">
          {loading ? "—" : summary.totalEvidence.toLocaleString()}
        </strong>
        <small className="evidence-stat-sub">
          {loading ? "Querying database..." : `${summary.loadedEvidence} in active view`}
        </small>
      </div>

      <div className="evidence-stat-card">
        <span className="evidence-stat-label">ASSOCIATED CASES</span>
        <strong className="evidence-stat-value">
          {loading ? "—" : summary.caseCount}
        </strong>
        <small className="evidence-stat-sub">
          In active filter partition
        </small>
      </div>

      <div className="evidence-stat-card">
        <span className="evidence-stat-label">DOMINANT ARTIFACT TYPE</span>
        <strong className="evidence-stat-value evidence-stat-value--accent">
          {loading ? "—" : summary.topType.toUpperCase()}
        </strong>
        <small className="evidence-stat-sub">
          {summary.topTypeCount} artifacts logged
        </small>
      </div>

      <div className="evidence-stat-card evidence-stat-card--integrity">
        <div className="evidence-stat-header">
          <span className="evidence-stat-label">CHAIN OF CUSTODY INTEGRITY</span>
          <span className="evidence-integrity-chip">
            {integrityPercent}% INTACT
          </span>
        </div>
        <strong className="evidence-stat-value">
          {loading ? "—" : `${summary.intactIntegrityCount} / ${summary.loadedEvidence}`}
        </strong>
        <div className="evidence-integrity-bar">
          <span
            className="evidence-integrity-fill"
            style={{ width: `${integrityPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
