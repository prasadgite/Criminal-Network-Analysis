import type { TimelineEvent } from '@/domain/investigation/timeline';
import TimelineEventCard from './TimelineEventCard';

interface TimelineStreamProps {
  events: TimelineEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: TimelineEvent) => void;
}

export default function TimelineStream({
  events,
  selectedEventId,
  onSelectEvent,
}: TimelineStreamProps) {
  if (events.length === 0) {
    return (
      <div className="timeline-empty">
        <strong>No timeline events found</strong>
        <p>No activity matches the current entity, case, or date filters.</p>
      </div>
    );
  }

  return (
    <div className="timeline-stream">
      <div className="timeline-stream__track" />
      {events.map((event) => (
        <div key={event.eventId} className="timeline-stream__item">
          <div className="timeline-stream__node" />
          <TimelineEventCard
            event={event}
            selected={event.eventId === selectedEventId}
            onSelect={onSelectEvent}
          />
        </div>
      ))}
    </div>
  );
}
