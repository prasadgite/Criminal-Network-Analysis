import { useMemo, useState } from "react";

import type { InvestigationLocation } from "@/domain/investigation/location";

interface LocationMapProps {
  locations: InvestigationLocation[];
  selectedLocationId?: string;
  onSelect: (location: InvestigationLocation) => void;
}

interface Point {
  x: number;
  y: number;
}

const WIDTH = 900;
const HEIGHT = 520;
const PADDING = 50;

function getSensitivity(location: InvestigationLocation) {
  const value = location.metadata?.sensitivityLevel;

  if (typeof value !== "string") {
    return "unknown";
  }

  return value.toLowerCase();
}

export default function LocationMap({
  locations,
  selectedLocationId,
  onSelect,
}: LocationMapProps) {
  const [hovered, setHovered] =
    useState<InvestigationLocation | null>(null);

  const points = useMemo(() => {
    const valid = locations.filter(
      (location) =>
        typeof location.latitude === "number" &&
        typeof location.longitude === "number",
    );

    if (!valid.length) {
      return new Map<string, Point>();
    }

    const latitudes = valid.map((location) => location.latitude!);
    const longitudes = valid.map((location) => location.longitude!);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const result = new Map<string, Point>();

    for (const location of valid) {
      const x =
        PADDING +
        ((location.longitude! - minLng) / lngRange) *
          (WIDTH - PADDING * 2);

      const y =
        HEIGHT -
        PADDING -
        ((location.latitude! - minLat) / latRange) *
          (HEIGHT - PADDING * 2);

      result.set(location.locationId, { x, y });
    }

    return result;
  }, [locations]);

  return (
    <div className="location-map">
      <div className="location-map-header">
        <div>
          <span className="eyebrow">GEOSPATIAL INTELLIGENCE</span>
          <h3>Location Distribution</h3>
        </div>

        <span className="map-count">
          {locations.length} LOCATIONS
        </span>
      </div>

      <div className="location-map-canvas">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Location intelligence map"
        >
          <defs>
            <pattern
              id="location-grid"
              width="45"
              height="45"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 45 0 L 0 0 0 45"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.18"
              />
            </pattern>
            <filter id="radar-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            width={WIDTH}
            height={HEIGHT}
            fill="url(#location-grid)"
          />

          <rect
            x={PADDING}
            y={PADDING}
            width={WIDTH - PADDING * 2}
            height={HEIGHT - PADDING * 2}
            fill="none"
            stroke="currentColor"
            opacity="0.18"
          />

          {[120, 180, 240].map((radius) => (
            <circle
              key={radius}
              cx={WIDTH / 2}
              cy={HEIGHT / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              opacity="0.1"
            />
          ))}

          <line
            x1={WIDTH / 2}
            y1={PADDING}
            x2={WIDTH / 2}
            y2={HEIGHT - PADDING}
            stroke="currentColor"
            opacity="0.1"
          />

          <line
            x1={PADDING}
            y1={HEIGHT / 2}
            x2={WIDTH - PADDING}
            y2={HEIGHT / 2}
            stroke="currentColor"
            opacity="0.1"
          />

          {locations.map((location) => {
            const point = points.get(location.locationId);

            if (!point) {
              return null;
            }

            const selected =
              selectedLocationId === location.locationId;

            const sensitivity = getSensitivity(location);

            return (
              <g
                key={location.locationId}
                transform={`translate(${point.x}, ${point.y})`}
                className={`location-marker ${sensitivity} ${
                  selected ? "selected" : ""
                }`}
                onClick={() => onSelect(location)}
                onMouseEnter={() => setHovered(location)}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`Select ${location.name ?? location.locationId}`}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onSelect(location);
                  }
                }}
              >
                {selected && (
                  <circle
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    opacity="0.7"
                    filter="url(#radar-glow)"
                    strokeDasharray="3 3"
                  />
                )}

                <circle r={selected ? 7 : 4} filter={selected ? "url(#radar-glow)" : undefined} />

                <circle
                  r={selected ? 11 : 8}
                  fill="none"
                  stroke="currentColor"
                  opacity={selected ? "0.6" : "0.25"}
                />
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="map-tooltip">
            <strong>
              {hovered.name ?? hovered.locationId}
            </strong>

            <span>
              {String(hovered.metadata?.locationType ?? "Site")} • {hovered.city ?? "Unknown city"}
            </span>

            <span>
              {hovered.latitude?.toFixed(6)},{" "}
              {hovered.longitude?.toFixed(6)}
            </span>
          </div>
        )}

        {!locations.length && (
          <div className="map-empty">
            No geospatial records available.
          </div>
        )}
      </div>

      <div className="location-map-footer">
        <span>● HIGH</span>
        <span>● MEDIUM</span>
        <span>● LOW</span>
        <span className="map-coordinates">
          WGS84 / LAT-LNG
        </span>
      </div>
    </div>
  );
}
