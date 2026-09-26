import { useState } from "react";
import { Link } from "react-router-dom";
import type { InvestigationFinding } from "@/domain/investigation/finding";
import {
  casePath,
  entityPath,
  networkPath,
  timelinePath,
  evidencePath,
} from "@/domain/investigation/context";

interface FindingInspectorProps {
  finding: InvestigationFinding | null;
  onClose: () => void;
}

export default function FindingInspector({
  finding,
  onClose,
}: FindingInspectorProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!finding) {
    return null;
  }

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
    <aside className="finding-inspector">
      <header className="finding-inspector__header">
        <div>
          <span className="eyebrow">ANALYTICAL INTELLIGENCE DOSSIER</span>
          <h2 className="finding-inspector__title">{finding.title}</h2>

          <div className="finding-inspector__tags">
            <span className="finding-id-badge">{finding.findingId}</span>
            <span
              className={`finding-severity-badge ${getSeverityBadgeClass(
                finding.severity,
              )}`}
            >
              {finding.severity.toUpperCase()}
            </span>
            <span className="finding-status-badge">
              STATUS: {finding.status.toUpperCase()}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="finding-inspector__close"
          onClick={onClose}
          title="Close Inspector"
        >
          ×
        </button>
      </header>

      <div className="finding-inspector__body">
        {/* Confidence & Detection Engine Card */}
        <section className="finding-inspector__section">
          <div className="section-title">DETECTION ALGORITHM & CONFIDENCE</div>

          <div className="finding-confidence-card">
            <div className="finding-confidence-header">
              <span className="finding-confidence-label">ANALYTICAL CONFIDENCE SCORE</span>
              <strong className="finding-confidence-val">{confidencePercent}%</strong>
            </div>

            <div className="finding-confidence-meter">
              <div
                className="finding-confidence-fill"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>

            <div className="finding-detection-meta">
              <div>
                <span className="finding-meta-key">ENGINE:</span>
                <span className="finding-meta-val">
                  {finding.detectionSource.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <div>
                <span className="finding-meta-key">SOURCE DATASET:</span>
                <span className="finding-meta-val">
                  {finding.sourceDataset || "cdr_records / transactions"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Finding Description */}
        <section className="finding-inspector__section">
          <div className="section-title">INTELLIGENCE FINDING DETAILS</div>
          <p className="finding-narrative-text">{finding.description}</p>
        </section>

        {/* Associated Case (if any) */}
        {finding.caseId && (
          <section className="finding-inspector__section">
            <div className="section-title">ASSOCIATED CASE INCIDENT</div>
            <div className="finding-case-box">
              <div>
                <span className="finding-subtext">CASE IDENTIFIER</span>
                <div className="finding-case-id">{finding.caseId}</div>
              </div>
              <Link
                to={casePath(finding.caseId)}
                className="finding-deep-link-btn"
              >
                OPEN CASE →
              </Link>
            </div>
          </section>
        )}

        {/* Involved Entities */}
        <section className="finding-inspector__section">
          <div className="finding-section-header">
            <div className="section-title">
              INVOLVED ENTITY SUBJECTS ({finding.entityReferences.length})
            </div>
            <span className="finding-subtext">cross-referenced</span>
          </div>

          {finding.entityReferences.length === 0 ? (
            <p className="finding-empty-notice">No specific entities cataloged.</p>
          ) : (
            <div className="finding-entities-list">
              {finding.entityReferences.map((ref) => (
                <div key={`${ref.entityType}-${ref.entityId}`} className="finding-entity-row">
                  <div className="finding-entity-info">
                    <span className="finding-type-tag">
                      {ref.entityType.toUpperCase()}
                    </span>
                    <strong className="finding-entity-id">{ref.entityId}</strong>
                    <span className="finding-entity-label">{ref.label}</span>
                  </div>

                  <div className="finding-entity-actions">
                    <Link
                      to={entityPath(ref.entityType, ref.entityId)}
                      className="finding-chip-link"
                    >
                      Dossier
                    </Link>
                    <Link
                      to={networkPath({ entityId: ref.entityId })}
                      className="finding-chip-link"
                    >
                      Network
                    </Link>
                    <Link
                      to={timelinePath({ entityId: ref.entityId })}
                      className="finding-chip-link"
                    >
                      Timeline
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Linked Relationships */}
        {finding.relationshipIds.length > 0 && (
          <section className="finding-inspector__section">
            <div className="section-title">
              DETECTED RELATIONSHIPS ({finding.relationshipIds.length})
            </div>
            <div className="finding-tags-cloud">
              {finding.relationshipIds.map((relId) => (
                <Link
                  key={relId}
                  to={networkPath({ relationshipId: relId })}
                  className="finding-relationship-chip"
                >
                  🔗 {relId}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Linked Timeline Events */}
        {finding.timelineEventIds.length > 0 && (
          <section className="finding-inspector__section">
            <div className="section-title">
              LINKED TIMELINE EVENTS ({finding.timelineEventIds.length})
            </div>
            <div className="finding-tags-cloud">
              {finding.timelineEventIds.map((tid) => (
                <Link
                  key={tid}
                  to={timelinePath({ eventId: tid })}
                  className="finding-timeline-chip"
                >
                  ⚡ {tid}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Supporting Evidence */}
        <section className="finding-inspector__section">
          <div className="section-title">
            SUPPORTING EVIDENCE ({finding.supportingEvidenceIds.length})
          </div>
          {finding.supportingEvidenceIds.length === 0 ? (
            <p className="finding-empty-notice">
              No supporting evidence references returned by detection service.
            </p>
          ) : (
            <div className="finding-tags-cloud">
              {finding.supportingEvidenceIds.map((eid) => (
                <Link
                  key={eid}
                  to={evidencePath(eid)}
                  className="finding-chip-link"
                >
                  📄 {eid}
                </Link>
              ))}
            </div>
          )}
        </section>


        {/* Detection Metadata */}
        {finding.metadata && Object.keys(finding.metadata).length > 0 && (
          <section className="finding-inspector__section">
            <div className="section-title">ALGORITHMIC PARAMETERS</div>
            <div className="finding-kv-table">
              {Object.entries(finding.metadata).map(([key, val]) => (
                <div key={key} className="finding-kv-row">
                  <span className="finding-kv-key">{key}:</span>
                  <strong className="finding-kv-val">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Raw JSON toggle */}
        <section className="finding-inspector__section">
          <button
            type="button"
            className="finding-toggle-json-btn"
            onClick={() => setShowRawJson((prev) => !prev)}
          >
            {showRawJson ? "▼ HIDE RAW METADATA JSON" : "▶ INSPECT RAW METADATA JSON"}
          </button>
          {showRawJson && (
            <pre className="finding-raw-json">
              {JSON.stringify(finding, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </aside>
  );
}
