import type { InvestigationEvidence } from "@/domain/investigation/evidence";

interface EvidenceCardProps {
  evidence: InvestigationEvidence;
  selected: boolean;
  onSelect: (evidence: InvestigationEvidence) => void;
}

export default function EvidenceCard({
  evidence,
  selected,
  onSelect,
}: EvidenceCardProps) {
  const meta = evidence.metadata ?? {};
  const chainOfCustody = (meta.chain_of_custody_id || meta.chainOfCustodyId || "—") as string;
  const accessLevel = (meta.access_level || meta.accessLevel || "Restricted") as string;
  const integrity = (meta.integrity_status || meta.integrityStatus || "Intact") as string;

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const isIntact = integrity.toLowerCase() === "intact" || integrity.toLowerCase() === "verified";

  return (
    <article
      className={`evidence-card ${selected ? "evidence-card--selected" : ""}`}
      onClick={() => onSelect(evidence)}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(evidence);
        }
      }}
    >
      <header className="evidence-card__header">
        <div className="evidence-card__badges">
          <span className="evidence-id-badge">{evidence.evidenceId}</span>
          <span className="evidence-type-badge">
            {evidence.evidenceType.toUpperCase()}
          </span>
          {evidence.caseId && (
            <span className="evidence-case-badge">
              📁 {evidence.caseId}
            </span>
          )}
        </div>

        <span
          className={`evidence-integrity-badge ${
            isIntact
              ? "evidence-integrity-badge--intact"
              : "evidence-integrity-badge--warning"
          }`}
        >
          {integrity.toUpperCase()}
        </span>
      </header>

      <h3 className="evidence-card__title">
        {evidence.title || `Evidence ${evidence.evidenceId}`}
      </h3>

      <div className="evidence-card__details">
        <div className="evidence-detail-row">
          <span className="evidence-detail-label">CUSTODY ID:</span>
          <span className="evidence-detail-val">{chainOfCustody}</span>
        </div>

        <div className="evidence-detail-row">
          <span className="evidence-detail-label">ACCESS LEVEL:</span>
          <span className="evidence-detail-val">{accessLevel}</span>
        </div>
      </div>

      <footer className="evidence-card__footer">
        <span className="evidence-date">
          🗓 {formatDate(evidence.collectedAt)}
        </span>

        <span className="evidence-card__action">
          {evidence.entityReferences.length > 0
            ? `👁 ${evidence.entityReferences.length} LINKS`
            : "OPEN DOSSIER →"}
        </span>
      </footer>
    </article>
  );
}
