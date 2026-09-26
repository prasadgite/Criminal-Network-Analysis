import type { TimelineEvent } from '@/domain/investigation/timeline';

interface TimelineEventCardProps {
  event: TimelineEvent;
  selected?: boolean;
  onSelect: (event: TimelineEvent) => void;
}

function formatEventTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getBadgeClass(type: string): string {
  switch (type) {
    case 'communication':
      return 'badge--phone';
    case 'transaction':
      return 'badge--bank';
    case 'location_event':
      return 'badge--location';
    case 'case_event':
      return 'badge--case';
    default:
      return 'badge--default';
  }
}

export default function TimelineEventCard({
  event,
  selected = false,
  onSelect,
}: TimelineEventCardProps) {
  return (
    <article
      className={`timeline-card ${selected ? 'timeline-card--selected' : ''}`}
      onClick={() => onSelect(event)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(event);
        }
      }}
    >
      <div className="timeline-card__header">
        <span className={`timeline-badge ${getBadgeClass(event.eventType)}`}>
          {event.eventType.replaceAll('_', ' ')}
        </span>
        <time className="timeline-card__time" dateTime={event.timestamp}>
          {formatEventTime(event.timestamp)}
        </time>
      </div>

      <h3 className="timeline-card__title">{event.title}</h3>

      {event.description && (
        <p className="timeline-card__description">{event.description}</p>
      )}

      <div className="timeline-card__footer">
        {event.locationId && (
          <span className="timeline-chip timeline-chip--location">
            📍 {event.locationId}
          </span>
        )}
        {event.sourceDataset && (
          <span className="timeline-chip">
            📁 {event.sourceDataset}
          </span>
        )}
        {event.entityReferences.length > 0 && (
          <span className="timeline-chip timeline-chip--entities">
            👥 {event.entityReferences.length} entity{event.entityReferences.length > 1 ? 'ies' : ''}
          </span>
        )}
      </div>
    </article>
  );
}
