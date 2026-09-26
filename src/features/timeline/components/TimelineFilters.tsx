import type { TimelineEventType } from '@/domain/investigation/timeline';

export interface TimelineFiltersState {
  entityId: string;
  caseId: string;
  eventType: TimelineEventType | '';
  startDate: string;
  endDate: string;
  limit: number;
}

interface TimelineFiltersProps {
  filters: TimelineFiltersState;
  onChange: (updated: Partial<TimelineFiltersState>) => void;
  onReset: () => void;
  loading?: boolean;
}

const eventTypeOptions: { value: TimelineEventType | ''; label: string }[] = [
  { value: '', label: 'All Event Types' },
  { value: 'communication', label: 'Communications (Calls)' },
  { value: 'transaction', label: 'Financial Transactions' },
  { value: 'location_event', label: 'Location Sightings' },
  { value: 'case_event', label: 'Case Incidents' },
  { value: 'vehicle_movement', label: 'Vehicle Movements' },
  { value: 'evidence_event', label: 'Evidence Collection' },
];

export default function TimelineFilters({
  filters,
  onChange,
  onReset,
  loading = false,
}: TimelineFiltersProps) {
  return (
    <div className="timeline-filters">
      <div className="timeline-filter-group">
        <label className="timeline-filter-item">
          <span>Entity ID</span>
          <input
            type="text"
            value={filters.entityId}
            onChange={(e) => onChange({ entityId: e.target.value })}
            placeholder="e.g. PH004485, P005911"
            disabled={loading}
          />
        </label>

        <label className="timeline-filter-item">
          <span>Case ID</span>
          <input
            type="text"
            value={filters.caseId}
            onChange={(e) => onChange({ caseId: e.target.value })}
            placeholder="e.g. C000003"
            disabled={loading}
          />
        </label>

        <label className="timeline-filter-item">
          <span>Event Type</span>
          <select
            value={filters.eventType}
            onChange={(e) =>
              onChange({ eventType: e.target.value as TimelineEventType | '' })
            }
            disabled={loading}
          >
            {eventTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="timeline-filter-group">
        <label className="timeline-filter-item">
          <span>Start Date</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            disabled={loading}
          />
        </label>

        <label className="timeline-filter-item">
          <span>End Date</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            disabled={loading}
          />
        </label>

        <label className="timeline-filter-item">
          <span>Limit</span>
          <select
            value={filters.limit}
            onChange={(e) => onChange({ limit: Number(e.target.value) })}
            disabled={loading}
          >
            <option value={25}>25 events</option>
            <option value={50}>50 events</option>
            <option value={100}>100 events</option>
            <option value={200}>200 events</option>
          </select>
        </label>

        <button
          type="button"
          className="timeline-filter-reset"
          onClick={onReset}
          disabled={loading}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
