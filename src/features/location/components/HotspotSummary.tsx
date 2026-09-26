import type { HotspotSummary as Summary } from "@/features/locations/services/locationService";

interface HotspotSummaryProps {
  summary: Summary;
}

export default function HotspotSummary({
  summary,
}: HotspotSummaryProps) {
  const total =
    summary.highSensitivity +
    summary.mediumSensitivity +
    summary.lowSensitivity +
    summary.unknownSensitivity;

  const highPercent = total
    ? (summary.highSensitivity / total) * 100
    : 0;

  const mediumPercent = total
    ? (summary.mediumSensitivity / total) * 100
    : 0;

  const lowPercent = total
    ? (summary.lowSensitivity / total) * 100
    : 0;

  return (
    <section className="hotspot-summary">
      <div className="summary-card">
        <span className="summary-label">
          TOTAL LOCATIONS
        </span>

        <strong>{summary.totalLocations.toLocaleString()}</strong>

        <small>NeonDB records</small>
      </div>

      <div className="summary-card">
        <span className="summary-label">
          ACTIVE AREAS
        </span>

        <strong>{summary.activeAreas}</strong>

        <small>Current result set</small>
      </div>

      <div className="summary-card">
        <span className="summary-label">
          HIGH SENSITIVITY
        </span>

        <strong>{summary.highSensitivity}</strong>

        <small>Current result set</small>
      </div>

      <div className="summary-card">
        <span className="summary-label">
          TOP AREA
        </span>

        <strong>{summary.topArea ?? "—"}</strong>

        <small>
          {summary.topLocationType ?? "Unknown"} concentration
        </small>
      </div>

      <div className="sensitivity-summary">
        <div className="summary-label">
          SENSITIVITY DISTRIBUTION
        </div>

        <div className="sensitivity-bar">
          <span
            className="high"
            style={{ width: `${highPercent}%` }}
          />

          <span
            className="medium"
            style={{ width: `${mediumPercent}%` }}
          />

          <span
            className="low"
            style={{ width: `${lowPercent}%` }}
          />
        </div>

        <div className="sensitivity-legend">
          <span>HIGH {summary.highSensitivity}</span>
          <span>MEDIUM {summary.mediumSensitivity}</span>
          <span>LOW {summary.lowSensitivity}</span>
        </div>
      </div>
    </section>
  );
}
