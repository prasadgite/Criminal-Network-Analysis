import type { InvestigationFinding } from "@/domain/investigation/finding";

interface FindingCardProps {
  finding: InvestigationFinding;
  selected: boolean;
  onSelect: (finding: InvestigationFinding) => void;
}

export default function FindingCard({
  finding,
  selected,
  onSelect,
}: FindingCardProps) {
  const confidencePercent = Math.round((finding.confidence ?? 0) * 100);

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "finding-severity-badge--critical";
      case "high":
        return "finding-severity-badge--high";
      case "medium":
        return "finding-severity-badge--medium";
      default:
        return "finding-severity-badge--low";
    }
  };

  return (
    <article
      className={`finding-card ${selected ? "finding-card--selected" : ""}`}
      onClick={() => onSelect(finding)}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(finding);
        }
      }}
    >
      <header className="finding-card__header">
        <div className="finding-card__id-group">
          <span className="finding-id-badge">{finding.findingId}</span>
          <span
            className={`finding-severity-badge ${getSeverityBadgeClass(
              finding.severity,
            )}`}
          >
            {finding.severity.toUpperCase()}
          </span>
          <span className="finding-type-tag">
            {finding.findingType.replace(/_/g, " ").toUpperCase()}
          </span>
        </div>

        <span className="finding-confidence-badge">
          {confidencePercent}% CONFIDENCE
        </span>
      </header>

      <h3 className="finding-card__title">{finding.title}</h3>

      <p className="finding-card__description">{finding.description}</p>

      {finding.entityReferences.length > 0 && (
        <div className="finding-card__entities">
          <span className="finding-entities-label">SUBJECTS:</span>
          <div className="finding-entity-chips">
            {finding.entityReferences.slice(0, 3).map((ref) => (
              <span
                key={`${ref.entityType}-${ref.entityId}`}
                className="finding-entity-chip"
              >
                {ref.label || ref.entityId}
              </span>
            ))}
            {finding.entityReferences.length > 3 && (
              <span className="finding-entity-more">
                +{finding.entityReferences.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <footer className="finding-card__footer">
        <span className="finding-source-tag">
          DETECTED VIA {finding.detectionSource.replace(/_/g, " ").toUpperCase()}
        </span>

        <span className="finding-action-text">OPEN DOSSIER →</span>
      </footer>
    </article>
  );
}
