import { useState } from "react";
import { Link } from "react-router-dom";

import type { InvestigationLocation } from "@/domain/investigation/location";

interface LocationInspectorProps {
  location: InvestigationLocation | null;
  loading: boolean;
  onClose: () => void;
}

export default function LocationInspector({
  location,
  loading,
  onClose,
}: LocationInspectorProps) {
  const [copied, setCopied] = useState(false);

  if (!location && !loading) {
    return null;
  }

  const sensitivity = String(
    location?.metadata?.sensitivityLevel ?? "unknown",
  ).toLowerCase();

  const hasCoords =
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number";

  const handleCopyCoords = () => {
    if (!hasCoords) return;
    void navigator.clipboard.writeText(
      `${location!.latitude}, ${location!.longitude}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="location-inspector">
      <div className="inspector-header">
        <div>
          <span className="eyebrow">LOCATION RECORD</span>

          <h2>
            {location?.name ??
              location?.locationId ??
              "Loading..."}
          </h2>

          {location && (
            <div className="inspector-badges">
              <span className={`sensitivity sensitivity-${sensitivity}`}>
                {sensitivity.toUpperCase()} SENSITIVITY
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inspector-close"
          onClick={onClose}
          title="Close Inspector"
        >
          ×
        </button>
      </div>

      {loading && (
        <div className="inspector-loading">
          Loading location intelligence...
        </div>
      )}

      {location && !loading && (
        <div className="inspector-content">
          <section className="inspector-section">
            <div className="section-title">
              GEOSPATIAL DATA
            </div>

            <div className="inspector-grid">
              <div>
                <label>LOCATION ID</label>
                <strong>{location.locationId}</strong>
              </div>

              <div>
                <label>TYPE</label>
                <strong>
                  {String(
                    location.metadata?.locationType ??
                      "Unknown",
                  )}
                </strong>
              </div>

              <div>
                <label>LATITUDE</label>
                <strong>
                  {location.latitude?.toFixed(6) ?? "—"}
                </strong>
              </div>

              <div>
                <label>LONGITUDE</label>
                <strong>
                  {location.longitude?.toFixed(6) ?? "—"}
                </strong>
              </div>

              <div>
                <label>AREA</label>
                <strong>
                  {String(
                    location.metadata?.area ??
                      location.city ??
                      "—",
                  )}
                </strong>
              </div>

              <div>
                <label>PINCODE</label>
                <strong>
                  {String(
                    location.metadata?.pincode ?? "—",
                  )}
                </strong>
              </div>
            </div>

            {hasCoords && (
              <div className="inspector-coord-actions">
                <button
                  type="button"
                  className="inspector-action-btn"
                  onClick={handleCopyCoords}
                >
                  {copied ? "✓ COPIED" : "📋 COPY COORDS"}
                </button>

                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inspector-action-btn external"
                >
                  ↗ GOOGLE MAPS
                </a>
              </div>
            )}
          </section>

          {location.address && (
            <section className="inspector-section">
              <div className="section-title">
                ADDRESS
              </div>

              <p className="inspector-address">
                {location.address}
              </p>
            </section>
          )}

          <section className="inspector-section">
            <div className="section-title">
              ENTITY SIGHTINGS
            </div>

            {location.entityReferences.length === 0 ? (
              <div className="inspector-empty">
                No entity sightings returned.
              </div>
            ) : (
              <div className="entity-sighting-list">
                {location.entityReferences.map((entity) => (
                  <Link
                    key={`${entity.entityType}-${entity.entityId}`}
                    to={`/entities/${String(
                      entity.entityType,
                    ).toLowerCase()}/${encodeURIComponent(
                      entity.entityId,
                    )}`}
                    className="entity-sighting"
                  >
                    <span className="entity-type">
                      {entity.entityType}
                    </span>

                    <strong>
                      {entity.label ??
                        entity.entityId}
                    </strong>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="inspector-section">
            <div className="section-title">
              OBSERVATION WINDOW
            </div>

            <div className="observation-window">
              <div>
                <label>FIRST OBSERVED</label>
                <strong>
                  {location.firstObserved
                    ? new Date(
                        location.firstObserved,
                      ).toLocaleString()
                    : "—"}
                </strong>
              </div>

              <div>
                <label>LAST OBSERVED</label>
                <strong>
                  {location.lastObserved
                    ? new Date(
                        location.lastObserved,
                      ).toLocaleString()
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <section className="inspector-section">
            <div className="section-title">
              LINKED INTELLIGENCE
            </div>

            <div className="inspector-links">
              {location.entityReferences
                .slice(0, 5)
                .map((entity) => (
                  <div
                    key={`${entity.entityType}-${entity.entityId}-links`}
                    className="link-row"
                  >
                    <Link
                      to={`/network?entityId=${encodeURIComponent(
                        entity.entityId,
                      )}`}
                    >
                      OPEN NETWORK
                    </Link>

                    <Link
                      to={`/timeline?entityId=${encodeURIComponent(
                        entity.entityId,
                      )}`}
                    >
                      OPEN TIMELINE
                    </Link>
                  </div>
                ))}
            </div>
          </section>

          <section className="inspector-section">
            <div className="section-title">
              TIMELINE REFERENCES
            </div>

            <div className="timeline-reference-list">
              {location.timelineEventIds.map((eventId) => (
                <Link
                  key={eventId}
                  to={`/timeline?eventId=${encodeURIComponent(
                    eventId,
                  )}`}
                  className="timeline-reference"
                >
                  {eventId}
                </Link>
              ))}
            </div>
          </section>

          <section className="inspector-section">
            <div className="section-title">
              SOURCE
            </div>

            <div className="source-info">
              <span>
                Dataset:{" "}
                {location.sourceDataset ?? "—"}
              </span>

              <span>
                Record:{" "}
                {location.sourceRecordId ?? "—"}
              </span>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
