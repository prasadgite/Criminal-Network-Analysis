import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import { caseService } from "@/features/cases/services/caseService";
import { entityDomainService } from "@/domain/investigation/services/entityDomainService";
import { findingService } from "@/features/findings/services/findingService";
import { timelineService } from "@/features/timeline/services/timelineService";
import { locationService } from "@/features/locations/services/locationService";

import type { InvestigationFinding } from "@/domain/investigation/finding";
import type { TimelineEvent } from "@/domain/investigation/timeline";

import {
  casePath,
  entityPath,
  findingPath,
  networkPath,
  timelinePath,
  locationPath,
  evidencePath,
} from "@/domain/investigation/context";

import "./DashboardPage.css";

interface DashboardMetrics {
  totalCases: number;
  totalEntities: number;
  criticalFindings: number;
  highFindings: number;
  totalLocations: number;
  totalAlerts: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCases: 0,
    totalEntities: 0,
    criticalFindings: 0,
    highFindings: 0,
    totalLocations: 0,
    totalAlerts: 0,
  });

  const [priorityFindings, setPriorityFindings] = useState<InvestigationFinding[]>([]);
  const [recentActivity, setRecentActivity] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [caseSearchQuery, setCaseSearchQuery] = useState("");
  const [entitySearchQuery, setEntitySearchQuery] = useState("");

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [casesRes, entitiesRes, findingsRes, locationsRes, timelineRes] =
        await Promise.all([
          caseService.list({ pageSize: 5 }),
          entityDomainService.search({ limit: 5 }),
          findingService.listFindings({ limit: 20 }),
          locationService.listLocations({ limit: 5 }),
          timelineService.list({ limit: 6 }),
        ]);

      const critical = findingsRes.data.filter(
        (f) => f.severity === "critical",
      ).length;
      const high = findingsRes.data.filter((f) => f.severity === "high").length;

      setMetrics({
        totalCases: casesRes.total,
        totalEntities: entitiesRes.total,
        criticalFindings: critical,
        highFindings: high,
        totalLocations: locationsRes.total,
        totalAlerts: findingsRes.total,
      });

      setPriorityFindings(findingsRes.data.slice(0, 5));
      setRecentActivity(timelineRes);
    } catch (err) {
      console.error("Failed to load dashboard intelligence:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to aggregate intelligence feeds from NeonDB.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const handleCaseSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseSearchQuery.trim()) return;
    navigate(`/cases?search=${encodeURIComponent(caseSearchQuery.trim())}`);
  };

  const handleEntitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entitySearchQuery.trim()) return;
    navigate(`/entities?q=${encodeURIComponent(entitySearchQuery.trim())}`);
  };

  return (
    <div className="dashboard-page">
      {/* Executive Intelligence Header */}
      <header className="dashboard-header">
        <div>
          <span className="dashboard-header__eyebrow">
            SANDHAAN — CRIMINAL NETWORK INTELLIGENCE PLATFORM
          </span>
          <h1>Executive Investigation Dashboard</h1>
          <p>
            Real-time cross-dataset situational awareness synthesized from NeonDB intelligence stores.
          </p>
        </div>

        <div className="dashboard-header__actions">
          <div className="dashboard-status-badge">
            <span className="dashboard-status-pulse" />
            <span>NEONDB CONNECTED (LIVE)</span>
          </div>

          <button
            type="button"
            className="dashboard-refresh-btn"
            onClick={() => void loadDashboardData()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh Feed"}
          </button>
        </div>
      </header>

      {/* Quick Launch & Search Bar */}
      <section className="dashboard-quick-bar">
        <form className="dashboard-search-form" onSubmit={handleCaseSearch}>
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search Case File (e.g. C008259)..."
            value={caseSearchQuery}
            onChange={(e) => setCaseSearchQuery(e.target.value)}
          />
          <button type="submit" className="dashboard-search-btn">
            Search Cases
          </button>
        </form>

        <form className="dashboard-search-form" onSubmit={handleEntitySearch}>
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search Entity / Phone / Account..."
            value={entitySearchQuery}
            onChange={(e) => setEntitySearchQuery(e.target.value)}
          />
          <button type="submit" className="dashboard-search-btn">
            Search Entities
          </button>
        </form>

        <div className="dashboard-quick-links">
          <Link to={networkPath()} className="dashboard-quick-chip">
            🕸 Network Analysis
          </Link>
          <Link to={evidencePath()} className="dashboard-quick-chip">
            📁 Evidence Store
          </Link>
        </div>
      </section>

      {error && (
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#fca5a5",
            fontSize: "0.88rem",
          }}
        >
          <strong>Intelligence Feed Synchronization Issue:</strong> {error}
        </div>
      )}

      {/* KPI Threat & Inventory Matrix */}
      <section className="dashboard-kpi-grid">
        <Link to="/cases" className="dashboard-kpi-card dashboard-kpi-card--active">
          <span className="dashboard-kpi-label">Active Investigations</span>
          <div className="dashboard-kpi-val">
            {loading ? "…" : metrics.totalCases.toLocaleString("en-IN")}
          </div>
          <div className="dashboard-kpi-sub">
            <span>Indexed Case Dossiers</span>
            <span className="dashboard-kpi-arrow">Open Workspace →</span>
          </div>
        </Link>

        <Link to="/entities" className="dashboard-kpi-card dashboard-kpi-card--entities">
          <span className="dashboard-kpi-label">Tracked Entity Subjects</span>
          <div className="dashboard-kpi-val">
            {loading ? "…" : metrics.totalEntities.toLocaleString("en-IN")}
          </div>
          <div className="dashboard-kpi-sub">
            <span>Suspects, Phones & Accounts</span>
            <span className="dashboard-kpi-arrow">View Entities →</span>
          </div>
        </Link>

        <Link
          to={findingPath()}
          className="dashboard-kpi-card dashboard-kpi-card--critical"
        >
          <span className="dashboard-kpi-label">Critical Findings & Threats</span>
          <div className="dashboard-kpi-val">
            {loading ? "…" : metrics.criticalFindings}
          </div>
          <div className="dashboard-kpi-sub">
            <span>{metrics.totalAlerts} Total Alerts ({metrics.highFindings} High)</span>
            <span className="dashboard-kpi-arrow">Inspect Alerts →</span>
          </div>
        </Link>

        <Link to={locationPath()} className="dashboard-kpi-card dashboard-kpi-card--locations">
          <span className="dashboard-kpi-label">Monitored Locations</span>
          <div className="dashboard-kpi-val">
            {loading ? "…" : metrics.totalLocations.toLocaleString("en-IN")}
          </div>
          <div className="dashboard-kpi-sub">
            <span>Geospatial Hotspots</span>
            <span className="dashboard-kpi-arrow">Map View →</span>
          </div>
        </Link>
      </section>

      {/* Main Split: Priority Findings vs Recent Investigation Activity */}
      <div className="dashboard-main-grid">
        {/* Priority Intelligence Feed */}
        <section className="dashboard-feed-panel">
          <div className="dashboard-feed-header">
            <span className="dashboard-feed-title">
              ⚡ Priority Intelligence Alerts & Pattern Detections
            </span>
            <Link to="/findings" className="dashboard-feed-link">
              View All {metrics.totalAlerts} Findings →
            </Link>
          </div>

          <div className="dashboard-feed-body">
            {loading && priorityFindings.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", padding: "16px" }}>
                Querying algorithmic threat detections from NeonDB...
              </p>
            ) : priorityFindings.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.85rem", padding: "16px" }}>
                No active threats flagged in current partition.
              </p>
            ) : (
              priorityFindings.map((finding) => {
                const conf = Math.round((finding.confidence ?? 0) * 100);
                return (
                  <article key={finding.findingId} className="dashboard-finding-item">
                    <div className="dashboard-finding-item__top">
                      <h3 className="dashboard-finding-item__title">
                        {finding.title}
                      </h3>
                      <div className="dashboard-finding-item__badges">
                        <span
                          className={`dashboard-pill dashboard-pill--${finding.severity}`}
                        >
                          {finding.severity.toUpperCase()}
                        </span>
                        <span
                          className="dashboard-pill"
                          style={{
                            background: "rgba(56, 189, 248, 0.15)",
                            color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                          }}
                        >
                          {conf}% CONF
                        </span>
                      </div>
                    </div>

                    <p className="dashboard-finding-item__desc">
                      {finding.description}
                    </p>

                    <div className="dashboard-finding-item__bottom">
                      <div className="dashboard-finding-entities">
                        {finding.entityReferences.map((ref) => (
                          <Link
                            key={`${ref.entityType}-${ref.entityId}`}
                            to={entityPath(ref.entityType, ref.entityId)}
                            className="dashboard-entity-tag"
                            title={`Inspect ${ref.entityType}: ${ref.entityId}`}
                          >
                            {ref.entityType[0].toUpperCase()}: {ref.entityId}
                          </Link>
                        ))}
                      </div>

                      <Link
                        to={findingPath(finding.findingId, finding.caseId)}
                        className="dashboard-inspect-link"
                      >
                        Inspect Dossier →
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Recent Chronological Investigation Activity */}
        <section className="dashboard-feed-panel">
          <div className="dashboard-feed-header">
            <span className="dashboard-feed-title">
              🕒 Chronological Activity Stream
            </span>
            <Link to={timelinePath()} className="dashboard-feed-link">
              Open Timeline →
            </Link>
          </div>

          <div className="dashboard-feed-body">
            {loading && recentActivity.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", padding: "16px" }}>
                Aggregating chronological events from NeonDB...
              </p>
            ) : recentActivity.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.85rem", padding: "16px" }}>
                No recent timeline records logged.
              </p>
            ) : (
              recentActivity.map((ev) => {
                const dateStr = new Date(ev.timestamp).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                });
                return (
                  <div key={ev.eventId} className="dashboard-timeline-item">
                    <div className="dashboard-timeline-item__meta">
                      <span className="dashboard-timeline-type">
                        {ev.eventType.replace("_", " ")}
                      </span>
                      <span>{dateStr}</span>
                    </div>

                    <div className="dashboard-timeline-item__title">
                      {ev.title}
                    </div>

                    <Link
                      to={timelinePath({ eventId: ev.eventId })}
                      className="dashboard-timeline-link"
                    >
                      View in Timeline Stream →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
