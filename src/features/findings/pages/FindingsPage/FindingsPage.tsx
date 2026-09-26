import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import type {
  InvestigationFinding,
  FindingSeverity,
  FindingType,
  FindingDetectionSource,
} from "@/domain/investigation/finding";

import {
  findingService,
  type FindingSummaryMetrics,
} from "../../services/findingService";

import FindingFilters, {
  type FindingFiltersState,
} from "../../components/FindingFilters";
import FindingList from "../../components/FindingList";
import FindingInspector from "../../components/FindingInspector";

import "./FindingsPage.css";

export default function FindingsPage() {
  const routeParams = useParams<{ caseId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCaseId = routeParams.caseId || searchParams.get("caseId") || "";
  const initialSeverity = (searchParams.get("severity") as FindingSeverity) || "ALL";
  const initialType = (searchParams.get("type") as FindingType) || "ALL";
  const initialSource = (searchParams.get("source") as FindingDetectionSource) || "ALL";
  const initialConfidence = Number(searchParams.get("confidence")) || 0;
  const initialLimit = Number(searchParams.get("limit")) || 50;
  const selectedId = searchParams.get("selected") || "";

  const [filters, setFilters] = useState<FindingFiltersState>({
    caseId: initialCaseId,
    severity: initialSeverity,
    findingType: initialType,
    detectionSource: initialSource,
    minConfidence: initialConfidence,
    limit: initialLimit,
  });

  const [findings, setFindings] = useState<InvestigationFinding[]>([]);
  const [serverTotal, setServerTotal] = useState<number>(0);
  const [selectedFinding, setSelectedFinding] = useState<InvestigationFinding | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load findings from NeonDB — strictly depends on query parameters, NOT selection
  const loadFindings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await findingService.listFindings({
        caseId: filters.caseId || undefined,
        severity: filters.severity,
        findingType: filters.findingType,
        detectionSource: filters.detectionSource,
        minConfidence: filters.minConfidence,
        limit: filters.limit,
      });

      setFindings(result.data);
      setServerTotal(result.total);
    } catch (err) {
      console.error("Failed to load intelligence findings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to query findings intelligence from NeonDB.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    filters.caseId,
    filters.severity,
    filters.findingType,
    filters.detectionSource,
    filters.minConfidence,
    filters.limit,
  ]);

  useEffect(() => {
    void loadFindings();
  }, [loadFindings]);

  // Select finding — updates UI state and URL query param without triggering reload
  const handleSelectFinding = (finding: InvestigationFinding) => {
    setSelectedFinding(finding);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("selected", finding.findingId);
      return next;
    }, { replace: true });
  };

  const closeInspector = () => {
    setSelectedFinding(null);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("selected");
      return next;
    }, { replace: true });
  };

  // URL selection sync — purely local memory matching or single ID retrieval
  useEffect(() => {
    if (!selectedId) {
      setSelectedFinding(null);
      return;
    }

    if (selectedFinding?.findingId === selectedId) {
      return;
    }

    const found = findings.find((f) => f.findingId === selectedId);
    if (found) {
      setSelectedFinding(found);
    } else {
      void (async () => {
        const item = await findingService.getFindingById(selectedId);
        if (item) setSelectedFinding(item);
      })();
    }
  }, [selectedId, findings, selectedFinding?.findingId]);

  // Handle filter changes
  const handleApplyFilters = (newFilters: FindingFiltersState) => {
    setFilters(newFilters);

    const next = new URLSearchParams();
    if (newFilters.caseId) next.set("caseId", newFilters.caseId);
    if (newFilters.severity !== "ALL") next.set("severity", newFilters.severity);
    if (newFilters.findingType !== "ALL") next.set("type", newFilters.findingType);
    if (newFilters.detectionSource !== "ALL") next.set("source", newFilters.detectionSource);
    if (newFilters.minConfidence > 0) next.set("confidence", String(newFilters.minConfidence));
    if (newFilters.limit !== 50) next.set("limit", String(newFilters.limit));
    if (selectedId) next.set("selected", selectedId);

    setSearchParams(next);
  };

  const handleResetFilters = () => {
    const defaultFilters: FindingFiltersState = {
      caseId: "",
      severity: "ALL",
      findingType: "ALL",
      detectionSource: "ALL",
      minConfidence: 0,
      limit: 50,
    };
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());
  };

  // Compute summary metrics
  const summary: FindingSummaryMetrics = useMemo(() => {
    return findingService.computeSummary(findings, serverTotal);
  }, [findings, serverTotal]);

  return (
    <div className="findings-page">
      {/* Header */}
      <header className="findings-page__header">
        <div>
          <span className="eyebrow">SANDHAAN / CROSS-DATASET ALGORITHMIC ENGINE</span>
          <h1>Findings Intelligence</h1>
          <p>
            Automated intelligence alerts derived from high-frequency CDR bursts,
            anomalous fund transfers, and cross-case repeat subject tracking.
          </p>
        </div>

        <div className="findings-status-pill">
          <span className="status-dot" />
          NEONDB ANALYTICS ACTIVE
        </div>
      </header>

      {/* Summary Metrics Bar */}
      <section className="findings-summary-bar">
        <div className="findings-stat-card">
          <span className="findings-stat-label">TOTAL ALERTS</span>
          <strong className="findings-stat-value">
            {loading ? "—" : summary.loaded}
          </strong>
          <small className="findings-stat-sub">
            {summary.total} generated across dataset
          </small>
        </div>

        <div className="findings-stat-card findings-stat-card--critical">
          <span className="findings-stat-label">CRITICAL THREATS</span>
          <strong className="findings-stat-value">
            {loading ? "—" : summary.criticalCount}
          </strong>
          <small className="findings-stat-sub">Requires immediate action</small>
        </div>

        <div className="findings-stat-card findings-stat-card--high">
          <span className="findings-stat-label">HIGH SEVERITY</span>
          <strong className="findings-stat-value">
            {loading ? "—" : summary.highCount}
          </strong>
          <small className="findings-stat-sub">Elevated pattern anomaly</small>
        </div>

        <div className="findings-stat-card">
          <span className="findings-stat-label">CONFIRMED STATUS</span>
          <strong className="findings-stat-value">
            {loading ? "—" : summary.confirmedCount}
          </strong>
          <small className="findings-stat-sub">Verified link topology</small>
        </div>

        <div className="findings-stat-card">
          <span className="findings-stat-label">AVG CONFIDENCE</span>
          <strong className="findings-stat-value findings-stat-value--accent">
            {loading ? "—" : `${summary.avgConfidence}%`}
          </strong>
          <small className="findings-stat-sub">Algorithmic scoring</small>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="findings-page__toolbar">
        <FindingFilters
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onRefresh={() => void loadFindings()}
          loading={loading}
        />
      </section>

      {/* Error state */}
      {error && (
        <div className="findings-error-banner">
          <div>
            <strong>INTELLIGENCE QUERY FAILED</strong>
            <p>{error}</p>
          </div>
          <button
            type="button"
            className="finding-btn finding-btn--secondary"
            onClick={() => void loadFindings()}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="findings-workspace">
        <div className="findings-list-container">
          <div className="findings-list-header">
            <div>
              <span className="eyebrow">INTELLIGENCE ALERTS</span>
              <h2>
                {findings.length} findings visible
              </h2>
            </div>

            <span className="findings-count-caption">
              Generated from CDR, Transactions, and Case entities
            </span>
          </div>

          <FindingList
            findings={findings}
            selectedFindingId={selectedFinding?.findingId || null}
            onSelectFinding={handleSelectFinding}
            loading={loading}
            onResetFilters={handleResetFilters}
          />
        </div>
      </main>

      {/* Slide-over Inspector */}
      <FindingInspector
        finding={selectedFinding}
        onClose={closeInspector}
      />
    </div>
  );
}
