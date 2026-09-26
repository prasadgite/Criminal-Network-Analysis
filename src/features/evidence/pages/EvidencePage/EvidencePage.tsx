import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import type { InvestigationEvidence } from "@/domain/investigation/evidence";
import {
  evidenceService,
  type EvidenceSummaryMetrics,
} from "../../services/evidenceService";

import EvidenceFilters, {
  type EvidenceFiltersState,
} from "../../components/EvidenceFilters";
import EvidenceSummary from "../../components/EvidenceSummary";
import EvidenceCard from "../../components/EvidenceCard";
import EvidenceInspector from "../../components/EvidenceInspector";

import "./EvidencePage.css";

export default function EvidencePage() {
  const routeParams = useParams<{ caseId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Route param takes precedence if on /cases/:caseId/evidence, else query param
  const initialCaseId = routeParams.caseId || searchParams.get("caseId") || "";
  const initialType = searchParams.get("type") || "All Types";
  const initialLimit = Number(searchParams.get("limit")) || 50;
  const initialOffset = Number(searchParams.get("offset")) || 0;
  const selectedId = searchParams.get("selected") || "";

  const [filters, setFilters] = useState<EvidenceFiltersState>({
    caseId: initialCaseId,
    type: initialType,
    limit: initialLimit,
  });

  const [offset, setOffset] = useState<number>(initialOffset);
  const [evidenceList, setEvidenceList] = useState<InvestigationEvidence[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedEvidence, setSelectedEvidence] = useState<InvestigationEvidence | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load evidence list from NeonDB
  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await evidenceService.listEvidence({
        caseId: filters.caseId || undefined,
        type: filters.type !== "All Types" ? filters.type : undefined,
        limit: filters.limit,
        offset,
      });

      setEvidenceList(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load evidence:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to query evidence intelligence from NeonDB.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, offset]);

  // Trigger load on filter or offset change
  useEffect(() => {
    void loadEvidence();
  }, [loadEvidence]);

  // Load deep detail for selected evidence
  const selectEvidence = useCallback(
    async (item: InvestigationEvidence) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("selected", item.evidenceId);
        return next;
      });

      setLoadingDetail(true);

      try {
        const detail = await evidenceService.getEvidenceById(item.evidenceId);
        setSelectedEvidence(detail || item);
      } catch (err) {
        console.error("Failed to load evidence detail:", err);
        setSelectedEvidence(item);
      } finally {
        setLoadingDetail(false);
      }
    },
    [setSearchParams],
  );

  const closeInspector = useCallback(() => {
    setSelectedEvidence(null);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("selected");
      return next;
    });
  }, [setSearchParams]);

  // Deep detail synchronization when selectedId changes in URL
  useEffect(() => {
    if (!selectedId) {
      setSelectedEvidence(null);
      return;
    }

    if (selectedEvidence?.evidenceId === selectedId) {
      return;
    }

    const inList = evidenceList.find((e) => e.evidenceId === selectedId);
    if (inList) {
      void selectEvidence(inList);
    } else {
      // Direct load if not in current page partition
      void (async () => {
        setLoadingDetail(true);
        try {
          const detail = await evidenceService.getEvidenceById(selectedId);
          if (detail) {
            setSelectedEvidence(detail);
          }
        } catch (err) {
          console.error("Failed to load direct evidence:", err);
        } finally {
          setLoadingDetail(false);
        }
      })();
    }
  }, [selectedId, evidenceList, selectedEvidence?.evidenceId, selectEvidence]);

  // Handle filter submission
  const handleApplyFilters = (newFilters: EvidenceFiltersState) => {
    setFilters(newFilters);
    setOffset(0); // Reset to first page

    const next = new URLSearchParams();
    if (newFilters.caseId) next.set("caseId", newFilters.caseId);
    if (newFilters.type && newFilters.type !== "All Types") next.set("type", newFilters.type);
    if (newFilters.limit !== 50) next.set("limit", String(newFilters.limit));
    next.set("offset", "0");
    if (selectedId) next.set("selected", selectedId);

    setSearchParams(next);
  };

  const handleResetFilters = () => {
    const defaultFilters: EvidenceFiltersState = {
      caseId: "",
      type: "All Types",
      limit: 50,
    };
    setFilters(defaultFilters);
    setOffset(0);
    setSearchParams(new URLSearchParams());
  };

  // Pagination navigation
  const currentPage = Math.floor(offset / filters.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  const handlePageChange = (newOffset: number) => {
    if (newOffset < 0 || newOffset >= total) return;
    setOffset(newOffset);

    const next = new URLSearchParams(searchParams);
    next.set("offset", String(newOffset));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute summary metrics
  const summary: EvidenceSummaryMetrics = useMemo(() => {
    return evidenceService.computeSummary(evidenceList, total);
  }, [evidenceList, total]);

  return (
    <div className="evidence-page">
      {/* Header */}
      <header className="evidence-page__header">
        <div>
          <span className="eyebrow">SANDHAAN / FORENSIC ARTIFACTS</span>
          <h1>Evidence Intelligence</h1>
          <p>
            Chain of custody tracking, SHA-256 cryptographic verification,
            case evidence dossiers, and forensic entity linkage.
          </p>
        </div>

        <div className="evidence-status-pill">
          <span className="status-dot" />
          NEONDB CONNECTED ({total.toLocaleString()} ARTIFACTS)
        </div>
      </header>

      {/* Forensic Summary Bar */}
      <EvidenceSummary summary={summary} loading={loading} />

      {/* Filter Toolbar */}
      <section className="evidence-page__toolbar">
        <EvidenceFilters
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onRefresh={() => void loadEvidence()}
          loading={loading}
        />
      </section>

      {/* Error state */}
      {error && (
        <div className="evidence-error-banner">
          <div>
            <strong>EVIDENCE QUERY FAILED</strong>
            <p>{error}</p>
          </div>
          <button
            type="button"
            className="evidence-btn evidence-btn--secondary"
            onClick={() => void loadEvidence()}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Main Grid & Pagination */}
      <main className="evidence-workspace">
        <div className="evidence-list-container">
          <div className="evidence-list-header">
            <div>
              <span className="eyebrow">FORENSIC REGISTRY</span>
              <h2>
                Showing {Math.min(offset + 1, total)}–
                {Math.min(offset + filters.limit, total)} of {total.toLocaleString()} artifacts
              </h2>
            </div>

            <div className="evidence-pagination-controls">
              <button
                type="button"
                className="evidence-btn evidence-btn--secondary evidence-btn--sm"
                onClick={() => handlePageChange(offset - filters.limit)}
                disabled={offset === 0 || loading}
              >
                ← PREV
              </button>

              <span className="evidence-page-indicator">
                PAGE {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                className="evidence-btn evidence-btn--secondary evidence-btn--sm"
                onClick={() => handlePageChange(offset + filters.limit)}
                disabled={offset + filters.limit >= total || loading}
              >
                NEXT →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="evidence-cards-skeleton">
              <div className="evidence-skeleton-card" />
              <div className="evidence-skeleton-card" />
              <div className="evidence-skeleton-card" />
              <div className="evidence-skeleton-card" />
              <div className="evidence-skeleton-card" />
              <div className="evidence-skeleton-card" />
            </div>
          ) : evidenceList.length === 0 ? (
            <div className="evidence-empty-box">
              <div className="evidence-empty-icon">📁</div>
              <h3>No Evidence Found</h3>
              <p>
                No forensic evidence matches your filter parameters. Try adjusting the Case ID or
                switching to &quot;All Types&quot;.
              </p>
              <button
                type="button"
                className="evidence-btn evidence-btn--secondary"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="evidence-cards-grid">
              {evidenceList.map((item) => (
                <EvidenceCard
                  key={item.evidenceId}
                  evidence={item}
                  selected={selectedEvidence?.evidenceId === item.evidenceId}
                  onSelect={selectEvidence}
                />
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {!loading && evidenceList.length > 0 && (
            <div className="evidence-bottom-pagination">
              <span className="evidence-page-summary">
                Artifacts {offset + 1} to {Math.min(offset + filters.limit, total)} of{" "}
                {total.toLocaleString()}
              </span>

              <div className="evidence-pagination-buttons">
                <button
                  type="button"
                  className="evidence-btn evidence-btn--secondary evidence-btn--sm"
                  onClick={() => handlePageChange(offset - filters.limit)}
                  disabled={offset === 0}
                >
                  ← PREV
                </button>
                <button
                  type="button"
                  className="evidence-btn evidence-btn--secondary evidence-btn--sm"
                  onClick={() => handlePageChange(offset + filters.limit)}
                  disabled={offset + filters.limit >= total}
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Inspector */}
      <EvidenceInspector
        evidence={selectedEvidence}
        loading={loadingDetail}
        onClose={closeInspector}
      />
    </div>
  );
}
