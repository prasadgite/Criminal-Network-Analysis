import { Link } from 'react-router-dom';
import type { TimelineEvent } from '@/domain/investigation/timeline';
import { routes } from '@/routes/routePaths';

interface TimelineEventInspectorProps {
  event: TimelineEvent | null;
  onClose?: () => void;
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
}

export default function TimelineEventInspector({
  event,
  onClose,
}: TimelineEventInspectorProps) {
  if (!event) {
    return (
      <aside className="timeline-inspector">
        <div className="timeline-inspector__empty">
          <strong>No Event Selected</strong>
          <p>Click on any event card in the timeline stream to inspect its full intelligence details.</p>
        </div>
      </aside>
    );
  }

  const metadataEntries = event.metadata ? Object.entries(event.metadata) : [];

  return (
    <aside className="timeline-inspector">
      <div className="timeline-inspector__header">
        <div>
          <span className="timeline-inspector__eyebrow">
            {event.eventType.replaceAll('_', ' ')}
          </span>
          <h3>{event.title}</h3>
        </div>
        {onClose && (
          <button
            type="button"
            className="timeline-inspector__close"
            onClick={onClose}
            aria-label="Close inspector"
          >
            ×
          </button>
        )}
      </div>

      <div className="timeline-inspector__section">
        <span className="timeline-inspector__label">Timestamp</span>
        <strong>{formatDate(event.timestamp)}</strong>
      </div>

      {event.description && (
        <div className="timeline-inspector__section">
          <span className="timeline-inspector__label">Description</span>
          <p>{event.description}</p>
        </div>
      )}

      {event.locationId && (
        <div className="timeline-inspector__section">
          <span className="timeline-inspector__label">Location ID</span>
          <strong>📍 {event.locationId}</strong>
        </div>
      )}

      {event.caseId && (
        <div className="timeline-inspector__section">
          <span className="timeline-inspector__label">Associated Case</span>
          <Link to={routes.cases.detail(event.caseId)}>
            📁 {event.caseId}
          </Link>
        </div>
      )}

      <div className="timeline-inspector__section">
        <span className="timeline-inspector__label">Entity References ({event.entityReferences.length})</span>
        {event.entityReferences.length === 0 ? (
          <p className="timeline-inspector__muted">No direct entity references.</p>
        ) : (
          <ul className="timeline-inspector__entities">
            {event.entityReferences.map((ref, idx) => (
              <li key={`${ref.entityId}-${idx}`} className="timeline-inspector__entity">
                <div>
                  <strong>{ref.label || ref.entityId}</strong>
                  <small>{ref.entityType} · {ref.entityId}</small>
                </div>
                <Link
                  to={`/network/${ref.entityId}`}
                  className="timeline-inspector__link"
                  title="Explore entity in Network Analysis"
                >
                  Network →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(event.sourceDataset || event.sourceRecordId) && (
        <div className="timeline-inspector__section">
          <span className="timeline-inspector__label">Data Provenance</span>
          <dl className="timeline-inspector__dl">
            <dt>Source Dataset</dt>
            <dd>{event.sourceDataset ?? '—'}</dd>
            <dt>Source Record ID</dt>
            <dd>{event.sourceRecordId ?? '—'}</dd>
          </dl>
        </div>
      )}

      {metadataEntries.length > 0 && (
        <div className="timeline-inspector__section">
          <span className="timeline-inspector__label">Dynamic Attributes</span>
          <dl className="timeline-inspector__dl">
            {metadataEntries.map(([key, val]) => (
              <div key={key} className="timeline-inspector__row">
                <dt>{key.replaceAll('_', ' ')}</dt>
                <dd>
                  {typeof val === 'object' && val !== null
                    ? JSON.stringify(val)
                    : String(val)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </aside>
  );
}
