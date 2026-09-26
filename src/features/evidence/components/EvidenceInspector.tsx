import { useState } from "react";
import { Link } from "react-router-dom";
import type { InvestigationEvidence } from "@/domain/investigation/evidence";
import {
  casePath,
  entityPath,
  networkPath,
  timelinePath,
  findingPath,
} from "@/domain/investigation/context";

interface EvidenceInspectorProps {
  evidence: InvestigationEvidence | null;
  loading: boolean;
  onClose: () => void;
}

export default function EvidenceInspector({
  evidence,
  loading,
  onClose,
}: EvidenceInspectorProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!evidence && !loading) {
    return null;
  }

  const meta = evidence?.metadata ?? {};
  const origHash = (meta.original_hash_sha256 || meta.originalHashSha256) as string | undefined;
  const currHash = (meta.current_hash_sha256 || meta.currentHashSha256) as string | undefined;
  const chainOfCustody = (meta.chain_of_custody_id || meta.chainOfCustodyId || "—") as string;
  const accessLevel = (meta.access_level || meta.accessLevel || "Restricted") as string;
  const integrityStatus = (meta.integrity_status || meta.integrityStatus || "Intact") as string;
  const collectedBy = (meta.collected_by || meta.collectedBy || "—") as string;
  const source = (meta.source || "Investigation Field Unit") as string;
  const filePath = (meta.file_path || meta.filePath || "—") as string;

  const isHashMatch = Boolean(origHash && currHash && origHash === currHash);

  const handleCopyHash = () => {
    if (!currHash && !origHash) return;
    void navigator.clipboard.writeText(currHash || origHash || "");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <aside className="evidence-inspector">
      <header className="evidence-inspector__header">
        <div>
          <span className="eyebrow">FORENSIC EVIDENCE RECORD</span>
          <h2 className="evidence-inspector__title">
            {evidence?.title || evidence?.evidenceId || "Loading..."}
          </h2>

          {evidence && (
            <div className="evidence-inspector__tags">
              <span className="evidence-id-badge">{evidence.evidenceId}</span>
              <span className="evidence-type-badge">
                {evidence.evidenceType.toUpperCase()}
              </span>
              <span className="evidence-access-badge">{accessLevel}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="evidence-inspector__close"
          onClick={onClose}
          title="Close Inspector"
        >
          ×
        </button>
      </header>

      {loading && (
        <div className="evidence-inspector__loading">
          Querying NeonDB forensic dossier for {evidence?.evidenceId}...
        </div>
      )}

      {evidence && !loading && (
        <div className="evidence-inspector__body">
          {/* SHA-256 Forensic Hash Verification */}
          <section className="evidence-inspector__section">
            <div className="section-title">FORENSIC HASH VERIFICATION</div>

            <div className="evidence-hash-card">
              <div
                className={`evidence-hash-status ${
                  isHashMatch
                    ? "evidence-hash-status--match"
                    : "evidence-hash-status--warning"
                }`}
              >
                {isHashMatch
                  ? "✓ SHA-256 MATCH — INTEGRITY INTACT"
                  : "⚠ HASH STATUS — " + integrityStatus.toUpperCase()}
              </div>

              <div className="evidence-hash-item">
                <span className="evidence-hash-label">ORIGINAL SHA-256 HASH</span>
                <code className="evidence-hash-code">
                  {origHash || "Not logged at collection"}
                </code>
              </div>

              <div className="evidence-hash-item">
                <span className="evidence-hash-label">CURRENT SHA-256 HASH</span>
                <code className="evidence-hash-code">
                  {currHash || "Pending re-verification"}
                </code>
              </div>

              {(currHash || origHash) && (
                <button
                  type="button"
                  className="evidence-btn evidence-btn--secondary evidence-btn--sm"
                  onClick={handleCopyHash}
                >
                  {copiedHash ? "✓ HASH COPIED" : "📋 COPY HASH"}
                </button>
              )}
            </div>
          </section>

          {/* Chain of Custody & Jurisdiction */}
          <section className="evidence-inspector__section">
            <div className="section-title">CHAIN OF CUSTODY & ACCESS</div>

            <div className="evidence-kv-table">
              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Custody Record ID:</span>
                <strong className="evidence-kv-val">{chainOfCustody}</strong>
              </div>

              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Collecting Officer:</span>
                <span className="evidence-kv-val">{collectedBy}</span>
              </div>

              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Collection Time:</span>
                <span className="evidence-kv-val">{formatDate(evidence.collectedAt)}</span>
              </div>

              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Security Access Level:</span>
                <span className="evidence-kv-val">{accessLevel}</span>
              </div>

              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Evidence Status:</span>
                <span className="evidence-kv-val">{evidence.status.toUpperCase()}</span>
              </div>
            </div>
          </section>

          {/* Associated Case */}
          {evidence.caseId && (
            <section className="evidence-inspector__section">
              <div className="section-title">ASSOCIATED CASE</div>
              <div className="evidence-case-link-card">
                <div>
                  <span className="evidence-subtext">PRIMARY INVESTIGATION</span>
                  <div className="evidence-case-id-display">{evidence.caseId}</div>
                </div>

                <Link
                  to={casePath(evidence.caseId)}
                  className="evidence-deep-link-btn"
                  title="Open Case Detail Workspace"
                >
                  OPEN CASE →
                </Link>
              </div>
            </section>
          )}

          {/* Linked Entities (from evidence_links) */}
          <section className="evidence-inspector__section">
            <div className="evidence-section-header">
              <div className="section-title">
                LINKED ENTITIES ({evidence.entityReferences.length})
              </div>
              <span className="evidence-subtext">from evidence_links</span>
            </div>

            {evidence.entityReferences.length === 0 ? (
              <p className="evidence-empty-notice">
                No direct entity relationships indexed in evidence_links for this artifact.
              </p>
            ) : (
              <div className="evidence-links-list">
                {evidence.entityReferences.map((ref) => (
                  <div key={`${ref.entityType}-${ref.entityId}`} className="evidence-link-item">
                    <div className="evidence-link-info">
                      <span className="evidence-type-badge">
                        {ref.entityType.toUpperCase()}
                      </span>
                      <strong className="evidence-link-id">{ref.entityId}</strong>
                      <span className="evidence-link-label">{ref.label}</span>
                    </div>

                    <div className="evidence-link-actions">
                      <Link
                        to={entityPath(ref.entityType, ref.entityId)}
                        className="evidence-chip-link"
                      >
                        Dossier
                      </Link>
                      <Link
                        to={networkPath({ entityId: ref.entityId })}
                        className="evidence-chip-link"
                      >
                        Network
                      </Link>
                      <Link
                        to={timelinePath({ entityId: ref.entityId })}
                        className="evidence-chip-link"
                      >
                        Timeline
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Linked Findings */}
          <section className="evidence-inspector__section">
            <div className="section-title">
              LINKED FINDINGS ({evidence.findingIds.length})
            </div>
            {evidence.findingIds.length === 0 ? (
              <p className="evidence-empty-notice">
                No finding references are exposed by the current Evidence API.
              </p>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                {evidence.findingIds.map((fId) => (
                  <Link
                    key={fId}
                    to={findingPath(fId)}
                    className="evidence-chip-link"
                  >
                    🔍 {fId}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Linked Timeline Events */}
          <section className="evidence-inspector__section">
            <div className="section-title">
              LINKED TIMELINE EVENTS ({evidence.timelineEventIds.length})
            </div>
            {evidence.timelineEventIds.length === 0 ? (
              <p className="evidence-empty-notice">
                No timeline event references are indexed for this artifact.
              </p>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                {evidence.timelineEventIds.map((tId) => (
                  <Link
                    key={tId}
                    to={timelinePath({ eventId: tId })}
                    className="evidence-chip-link"
                  >
                    ⚡ {tId}
                  </Link>
                ))}
              </div>
            )}
          </section>


          {/* Storage & Provenance */}
          <section className="evidence-inspector__section">
            <div className="section-title">STORAGE & PROVENANCE</div>

            <div className="evidence-kv-table">
              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Source Subsystem:</span>
                <span className="evidence-kv-val">{source}</span>
              </div>

              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Archive Path:</span>
                <code className="evidence-path-code">{filePath}</code>
              </div>

              <div className="evidence-kv-row">
                <span className="evidence-kv-key">Source Dataset:</span>
                <span className="evidence-kv-val">{evidence.sourceDataset || "evidence"}</span>
              </div>
            </div>
          </section>

          {/* Raw Metadata Collapsible */}
          <section className="evidence-inspector__section">
            <button
              type="button"
              className="evidence-toggle-json-btn"
              onClick={() => setShowRawJson((prev) => !prev)}
            >
              {showRawJson ? "▼ HIDE RAW METADATA JSON" : "▶ INSPECT RAW METADATA JSON"}
            </button>

            {showRawJson && (
              <pre className="evidence-raw-json">
                {JSON.stringify(evidence.metadata || {}, null, 2)}
              </pre>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}
