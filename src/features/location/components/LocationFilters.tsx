import { useState } from "react";

interface LocationFiltersProps {
  query: string;
  city: string;
  locationType: string;
  limit: number;

  onApply: (filters: {
    query: string;
    city: string;
    locationType: string;
    limit: number;
  }) => void;

  onRefresh: () => void;
}

const LOCATION_TYPES = [
  "All Types",
  "ATM",
  "Residential",
  "Commercial",
  "Police Station",
  "Hospital",
  "Office",
  "Hotel",
  "Other",
];

export default function LocationFilters({
  query,
  city,
  locationType,
  limit,
  onApply,
  onRefresh,
}: LocationFiltersProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const [localCity, setLocalCity] = useState(city);
  const [localType, setLocalType] = useState(locationType);
  const [localLimit, setLocalLimit] = useState(limit);

  const apply = () => {
    onApply({
      query: localQuery.trim(),
      city: localCity.trim(),
      locationType: localType,
      limit: localLimit,
    });
  };

  const reset = () => {
    setLocalQuery("");
    setLocalCity("");
    setLocalType("All Types");
    setLocalLimit(50);

    onApply({
      query: "",
      city: "",
      locationType: "All Types",
      limit: 50,
    });
  };

  return (
    <div className="location-filters">
      <div className="location-filter-field">
        <label>SEARCH</label>

        <input
          value={localQuery}
          onChange={(event) => setLocalQuery(event.target.value)}
          placeholder="Location ID, name, address..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              apply();
            }
          }}
        />
      </div>

      <div className="location-filter-field">
        <label>CITY</label>

        <input
          value={localCity}
          onChange={(event) => setLocalCity(event.target.value)}
          placeholder="e.g. Pune"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              apply();
            }
          }}
        />
      </div>

      <div className="location-filter-field">
        <label>TYPE</label>

        <select
          value={localType}
          onChange={(event) => setLocalType(event.target.value)}
        >
          {LOCATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="location-filter-field limit-field">
        <label>LIMIT</label>

        <select
          value={localLimit}
          onChange={(event) =>
            setLocalLimit(Number(event.target.value))
          }
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="location-filter-actions">
        <button onClick={apply}>APPLY</button>

        <button onClick={reset} className="secondary">
          RESET
        </button>

        <button onClick={onRefresh} className="secondary">
          ↻
        </button>
      </div>
    </div>
  );
}
