import { useState, useEffect } from "react";
import type {
  FindingSeverity,
  FindingType,
  FindingDetectionSource,
} from "@/domain/investigation/finding";

export interface FindingFiltersState {
  caseId: string;
  severity: FindingSeverity | "ALL";
  findingType: FindingType | "ALL";
  detectionSource: FindingDetectionSource | "ALL";
  minConfidence: number;
  limit: number;
}

interface FindingFiltersProps {
  filters: FindingFiltersState;
  onApply: (filters: FindingFiltersState) => void;
  onReset: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const SEVERITIES: Array<FindingSeverity | "ALL"> = [
  "ALL",
  "critical",
  "high",
  "medium",
  "low",
];

const FINDING_TYPES: Array<FindingType | "ALL"> = [
  "ALL",
  "communication_pattern",
  "financial_pattern",
  "suspicious_relationship",
  "location_pattern",
  "behavioral_pattern",
  "network_pattern",
  "identity_match",
  "anomaly",
];

const DETECTION_SOURCES: Array<FindingDetectionSource | "ALL"> = [
  "ALL",
  "rule",
  "statistical_model",
  "graph_analysis",
  "ml_model",
  "manual",
];

const CONFIDENCE_LEVELS = [
  { label: "All Confidence", value: 0 },
  { label: "80%+ Confidence", value: 0.8 },
  { label: "90%+ Confidence", value: 0.9 },
  { label: "95%+ Confidence", value: 0.95 },
];

const LIMITS = [30, 50, 100];

export default function FindingFilters({
  filters,
  onApply,
  onReset,
  onRefresh,
  loading = false,
}: FindingFiltersProps) {
  const [localCaseId, setLocalCaseId] = useState(filters.caseId);
  const [localSeverity, setLocalSeverity] = useState(filters.severity);
  const [localType, setLocalType] = useState(filters.findingType);
  const [localSource, setLocalSource] = useState(filters.detectionSource);
  const [localConfidence, setLocalConfidence] = useState(filters.minConfidence);
  const [localLimit, setLocalLimit] = useState(filters.limit);

  useEffect(() => {
    setLocalCaseId(filters.caseId);
    setLocalSeverity(filters.severity);
    setLocalType(filters.findingType);
    setLocalSource(filters.detectionSource);
    setLocalConfidence(filters.minConfidence);
    setLocalLimit(filters.limit);
  }, [filters]);

  const handleApply = () => {
    onApply({
      caseId: localCaseId.trim(),
      severity: localSeverity,
      findingType: localType,
      detectionSource: localSource,
      minConfidence: localConfidence,
      limit: localLimit,
    });
  };

  const handleReset = () => {
    setLocalCaseId("");
    setLocalSeverity("ALL");
    setLocalType("ALL");
    setLocalSource("ALL");
    setLocalConfidence(0);
    setLocalLimit(50);
    onReset();
  };

  return (
    <div className="finding-filters">
      <div className="finding-filter-field finding-filter-field--case">
        <label htmlFor="finding-case-id">CASE ID</label>
        <input
          id="finding-case-id"
          type="text"
          value={localCaseId}
          onChange={(e) => setLocalCaseId(e.target.value)}
          placeholder="Filter by Case (e.g. C008259)..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleApply();
            }
          }}
          className="finding-input"
        />
      </div>

      <div className="finding-filter-field">
        <label htmlFor="finding-severity-select">SEVERITY</label>
        <select
          id="finding-severity-select"
          value={localSeverity}
          onChange={(e) => setLocalSeverity(e.target.value as any)}
          className="finding-select"
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All Severities" : s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="finding-filter-field">
        <label htmlFor="finding-type-select">FINDING TYPE</label>
        <select
          id="finding-type-select"
          value={localType}
          onChange={(e) => setLocalType(e.target.value as any)}
          className="finding-select"
        >
          {FINDING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "ALL" ? "All Finding Types" : t.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="finding-filter-field">
        <label htmlFor="finding-source-select">DETECTION SOURCE</label>
        <select
          id="finding-source-select"
          value={localSource}
          onChange={(e) => setLocalSource(e.target.value as any)}
          className="finding-select"
        >
          {DETECTION_SOURCES.map((src) => (
            <option key={src} value={src}>
              {src === "ALL" ? "All Sources" : src.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="finding-filter-field">
        <label htmlFor="finding-confidence-select">CONFIDENCE</label>
        <select
          id="finding-confidence-select"
          value={localConfidence}
          onChange={(e) => setLocalConfidence(Number(e.target.value))}
          className="finding-select"
        >
          {CONFIDENCE_LEVELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="finding-filter-field finding-filter-field--limit">
        <label htmlFor="finding-limit-select">API LIMIT</label>
        <select
          id="finding-limit-select"
          value={localLimit}
          onChange={(e) => setLocalLimit(Number(e.target.value))}
          className="finding-select"
        >
          {LIMITS.map((lim) => (
            <option key={lim} value={lim}>
              {lim} records
            </option>
          ))}
        </select>
      </div>

      <div className="finding-filter-actions">
        <button
          type="button"
          className="finding-btn finding-btn--primary"
          onClick={handleApply}
          disabled={loading}
        >
          APPLY
        </button>

        <button
          type="button"
          className="finding-btn finding-btn--secondary"
          onClick={handleReset}
          disabled={loading}
        >
          RESET
        </button>

        <button
          type="button"
          className="finding-btn finding-btn--icon"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Findings"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
