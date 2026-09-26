import type { InvestigationFinding } from "@/domain/investigation/finding";
import FindingCard from "./FindingCard";

interface FindingListProps {
  findings: InvestigationFinding[];
  selectedFindingId: string | null;
  onSelectFinding: (finding: InvestigationFinding) => void;
  loading?: boolean;
  onResetFilters?: () => void;
}

export default function FindingList({
  findings,
  selectedFindingId,
  onSelectFinding,
  loading = false,
  onResetFilters,
}: FindingListProps) {
  if (loading) {
    return (
      <div className="finding-list-skeleton">
        <div className="finding-skeleton-card" />
        <div className="finding-skeleton-card" />
        <div className="finding-skeleton-card" />
        <div className="finding-skeleton-card" />
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="finding-empty-state">
        <div className="finding-empty-icon">⚡</div>
        <h3>No Analytical Findings Match Filters</h3>
        <p>
          Adjust severity, type, or confidence thresholds, or reset all filters to view
          the full algorithmic intelligence feed.
        </p>
        {onResetFilters && (
          <button
            type="button"
            className="finding-btn finding-btn--secondary"
            onClick={onResetFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="finding-list-grid">
      {findings.map((f) => (
        <FindingCard
          key={f.findingId}
          finding={f}
          selected={selectedFindingId === f.findingId}
          onSelect={onSelectFinding}
        />
      ))}
    </div>
  );
}
