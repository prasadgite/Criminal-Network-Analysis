import { Link } from 'react-router-dom';
import type { EntityRelationship } from '@/domain/investigation/relationship';
import { entityPath, timelinePath } from '@/domain/investigation/context';

interface RelationshipInspectorProps {
  relationship?: EntityRelationship | null;
}

function formatDate(value?: string) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function RelationshipInspector({
  relationship,
}: RelationshipInspectorProps) {
  if (!relationship) {
    return (
      <aside className="network-inspector">
        <div className="network-inspector__empty">
          <strong>No relationship selected</strong>

          <span>
            Select a relationship from the
            intelligence list.
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="network-inspector">
      <div className="network-inspector__header">
        <span className="network-inspector__eyebrow">
          RELATIONSHIP
        </span>

        <h3>
          {relationship.relationshipType.replaceAll(
            '_',
            ' ',
          )}
        </h3>
      </div>

      <div className="network-inspector__confidence">
        <span>Confidence</span>

        <strong>
          {Math.round(
            relationship.confidence * 100,
          )}
          %
        </strong>
      </div>

      <div className="network-inspector__section">
        <span className="network-inspector__label">
          Source
        </span>

        <strong>
          {relationship.source.label}
        </strong>

        <small>
          {relationship.source.entityType}
          {' · '}
          {relationship.source.entityId}
        </small>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <Link
            to={entityPath(relationship.source.entityType, relationship.source.entityId)}
            style={{ color: '#38bdf8', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Dossier →
          </Link>
          <Link
            to={timelinePath({ entityId: relationship.source.entityId })}
            style={{ color: '#94a3b8', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Timeline →
          </Link>
        </div>
      </div>

      <div className="network-inspector__section">
        <span className="network-inspector__label">
          Target
        </span>

        <strong>
          {relationship.target.label}
        </strong>

        <small>
          {relationship.target.entityType}
          {' · '}
          {relationship.target.entityId}
        </small>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <Link
            to={entityPath(relationship.target.entityType, relationship.target.entityId)}
            style={{ color: '#38bdf8', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Dossier →
          </Link>
          <Link
            to={timelinePath({ entityId: relationship.target.entityId })}
            style={{ color: '#94a3b8', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Timeline →
          </Link>
        </div>
      </div>

      <div className="network-inspector__section">
        <span className="network-inspector__label">
          Observation
        </span>

        <div className="network-inspector__row">
          <span>First observed</span>
          <span>
            {formatDate(
              relationship.firstObserved,
            )}
          </span>
        </div>

        <div className="network-inspector__row">
          <span>Last observed</span>
          <span>
            {formatDate(
              relationship.lastObserved,
            )}
          </span>
        </div>
      </div>

      {(relationship.sourceDataset ||
        relationship.sourceRecordId) && (
        <div className="network-inspector__section">
          <span className="network-inspector__label">
            Provenance
          </span>

          <div className="network-inspector__row">
            <span>Dataset</span>
            <span>
              {relationship.sourceDataset ?? '—'}
            </span>
          </div>

          <div className="network-inspector__row">
            <span>Record</span>
            <span>
              {relationship.sourceRecordId ?? '—'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
