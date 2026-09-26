import "./Emblem.css";

interface EmblemProps {
  compact?: boolean;
}

export function Emblem({ compact = false }: EmblemProps) {
  return (
    <div
      className={`emblem ${compact ? "emblem--compact" : ""}`}
      aria-label="Government emblem placeholder"
    >
      <div className="emblem-mark">
        <span>♜</span>
      </div>
      {!compact && <span className="emblem-motto">सत्यमेव जयते</span>}
    </div>
  );
}
