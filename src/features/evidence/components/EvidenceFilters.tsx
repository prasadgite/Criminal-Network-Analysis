import { useState, useEffect } from "react";

export interface EvidenceFiltersState {
  caseId: string;
  type: string;
  limit: number;
}

interface EvidenceFiltersProps {
  filters: EvidenceFiltersState;
  onApply: (filters: EvidenceFiltersState) => void;
  onReset: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const EVIDENCE_TYPES = [
  "All Types",
  "locationrecord",
  "image",
  "financialrecord",
  "callrecord",
  "document",
  "cctv",
  "audio",
  "video",
  "other",
];

const LIMITS = [20, 50, 100];

export default function EvidenceFilters({
  filters,
  onApply,
  onReset,
  onRefresh,
  loading = false,
}: EvidenceFiltersProps) {
  const [localCaseId, setLocalCaseId] = useState(filters.caseId);
  const [localType, setLocalType] = useState(filters.type);
  const [localLimit, setLocalLimit] = useState(filters.limit);

  useEffect(() => {
    setLocalCaseId(filters.caseId);
    setLocalType(filters.type);
    setLocalLimit(filters.limit);
  }, [filters]);

  const handleApply = () => {
    onApply({
      caseId: localCaseId.trim(),
      type: localType,
      limit: localLimit,
    });
  };

  const handleReset = () => {
    setLocalCaseId("");
    setLocalType("All Types");
    setLocalLimit(50);
    onReset();
  };

  return (
    <div className="evidence-filters">
      <div className="evidence-filter-field evidence-filter-field--case">
        <label htmlFor="evidence-case-id">CASE ID</label>
        <input
          id="evidence-case-id"
          type="text"
          value={localCaseId}
          onChange={(e) => setLocalCaseId(e.target.value)}
          placeholder="e.g. C008259, C002308..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleApply();
            }
          }}
          className="evidence-input"
        />
      </div>

      <div className="evidence-filter-field evidence-filter-field--type">
        <label htmlFor="evidence-type-select">EVIDENCE TYPE</label>
        <select
          id="evidence-type-select"
          value={localType}
          onChange={(e) => setLocalType(e.target.value)}
          className="evidence-select"
        >
          {EVIDENCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "All Types" ? "All Types" : t.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="evidence-filter-field evidence-filter-field--limit">
        <label htmlFor="evidence-limit-select">LIMIT</label>
        <select
          id="evidence-limit-select"
          value={localLimit}
          onChange={(e) => setLocalLimit(Number(e.target.value))}
          className="evidence-select"
        >
          {LIMITS.map((lim) => (
            <option key={lim} value={lim}>
              {lim} / page
            </option>
          ))}
        </select>
      </div>

      <div className="evidence-filter-actions">
        <button
          type="button"
          className="evidence-btn evidence-btn--primary"
          onClick={handleApply}
          disabled={loading}
        >
          APPLY
        </button>

        <button
          type="button"
          className="evidence-btn evidence-btn--secondary"
          onClick={handleReset}
          disabled={loading}
        >
          RESET
        </button>

        <button
          type="button"
          className="evidence-btn evidence-btn--icon"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh NeonDB evidence"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
