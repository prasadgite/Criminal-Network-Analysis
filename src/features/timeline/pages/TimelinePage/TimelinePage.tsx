import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { TimelineEvent } from '@/domain/investigation/timeline';
import TimelineFilters, { type TimelineFiltersState } from '../../components/TimelineFilters';
import TimelineStream from '../../components/TimelineStream';
import TimelineEventInspector from '../../components/TimelineEventInspector';
import { timelineService } from '../../services/timelineService';

import './TimelinePage.css';

export default function TimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<TimelineFiltersState>({
    entityId: searchParams.get('entityId') || '',
    caseId: searchParams.get('caseId') || '',
    eventType: (searchParams.get('eventType') as any) || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    limit: Number(searchParams.get('limit')) || 50,
  });

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlEventId = searchParams.get('eventId') || searchParams.get('selected') || '';

  const loadTimeline = useCallback(
    async (currentFilters: TimelineFiltersState) => {
      setLoading(true);
      setError(null);

      try {
        const result = await timelineService.list({
          caseId: currentFilters.caseId,
          entityId: currentFilters.entityId,
          eventType: currentFilters.eventType || undefined,
          startDate: currentFilters.startDate || undefined,
          endDate: currentFilters.endDate || undefined,
          limit: currentFilters.limit,
        });

        setEvents(result);

        // Select event: prioritize urlEventId, then existing selection, then first event
        if (result.length > 0) {
          if (urlEventId) {
            const directMatch = result.find((e) => e.eventId === urlEventId);
            if (directMatch) {
              setSelectedEvent(directMatch);
              return;
            }
          }

          setSelectedEvent((prev) =>
            prev ? result.find((e) => e.eventId === prev.eventId) || result[0] : result[0],
          );
        } else {
          setSelectedEvent(null);
        }
      } catch (err) {
        console.error('Failed to load timeline events', err);
        setError(
          err instanceof Error ? err.message : 'Unable to load timeline intelligence.',
        );
      } finally {
        setLoading(false);
      }
    },
    [urlEventId],
  );

  useEffect(() => {
    void loadTimeline(filters);
  }, [filters, loadTimeline]);

  const stats = useMemo(() => {
    let comms = 0;
    let txns = 0;
    let locs = 0;
    let cases = 0;

    for (const ev of events) {
      if (ev.eventType === 'communication') comms++;
      else if (ev.eventType === 'transaction') txns++;
      else if (ev.eventType === 'location_event') locs++;
      else if (ev.eventType === 'case_event') cases++;
    }

    return { total: events.length, comms, txns, locs, cases };
  }, [events]);

  const handleFilterChange = (updated: Partial<TimelineFiltersState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };
      const params = new URLSearchParams();
      if (next.entityId) params.set('entityId', next.entityId);
      if (next.caseId) params.set('caseId', next.caseId);
      if (next.eventType) params.set('eventType', next.eventType);
      if (next.startDate) params.set('startDate', next.startDate);
      if (next.endDate) params.set('endDate', next.endDate);
      if (next.limit !== 50) params.set('limit', String(next.limit));
      setSearchParams(params, { replace: true });
      return next;
    });
  };

  const handleResetFilters = () => {
    const defaultState: TimelineFiltersState = {
      entityId: '',
      caseId: '',
      eventType: '',
      startDate: '',
      endDate: '',
      limit: 50,
    };
    setFilters(defaultState);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="timeline-page">
      <header className="timeline-page__header">
        <div>
          <span className="timeline-page__eyebrow">CHRONOLOGICAL INTELLIGENCE</span>
          <h1>Timeline Analysis</h1>
          <p>
            Chronological cross-dataset feed across call records, financial transfers, location sightings, and case incidents.
          </p>
        </div>

        <button
          type="button"
          className="timeline-refresh-btn"
          onClick={() => void loadTimeline(filters)}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : '↻ Refresh Feed'}
        </button>
      </header>

      <section className="timeline-stats">
        <div className="timeline-stat">
          <span>Loaded Events</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="timeline-stat">
          <span>Communications</span>
          <strong>{stats.comms}</strong>
        </div>
        <div className="timeline-stat">
          <span>Transactions</span>
          <strong>{stats.txns}</strong>
        </div>
        <div className="timeline-stat">
          <span>Location Sightings</span>
          <strong>{stats.locs}</strong>
        </div>
      </section>

      <section className="timeline-toolbar">
        <TimelineFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          loading={loading}
        />
      </section>

      {error && (
        <div className="timeline-error">
          <strong>Timeline Request Failed</strong>
          <span>{error}</span>
        </div>
      )}

      <main className="timeline-layout">
        <section className="timeline-main">
          {loading && (
            <div className="timeline-loading-banner">
              Fetching chronological records from NeonDB…
            </div>
          )}

          <TimelineStream
            events={events}
            selectedEventId={selectedEvent?.eventId}
            onSelectEvent={(event) => {
              setSelectedEvent(event);
              setSearchParams(
                (prev) => {
                  const n = new URLSearchParams(prev);
                  n.set('eventId', event.eventId);
                  return n;
                },
                { replace: true },
              );
            }}
          />
        </section>

        <section className="timeline-side">
          <TimelineEventInspector
            event={selectedEvent}
            onClose={() => {
              setSelectedEvent(null);
              setSearchParams(
                (prev) => {
                  const n = new URLSearchParams(prev);
                  n.delete('eventId');
                  n.delete('selected');
                  return n;
                },
                { replace: true },
              );
            }}
          />
        </section>
      </main>
    </div>
  );
}
