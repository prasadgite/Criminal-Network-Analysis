import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import type { InvestigationLocation } from "@/domain/investigation/location";

import {
  locationService,
  type HotspotSummary as Summary,
} from "@/features/locations/services/locationService";

import LocationFilters from "../../components/LocationFilters";
import LocationMap from "../../components/LocationMap";
import LocationCard from "../../components/LocationCard";
import HotspotSummary from "../../components/HotspotSummary";
import LocationInspector from "../../components/LocationInspector";

import "./LocationPage.css";

export default function LocationPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [locations, setLocations] = useState<
    InvestigationLocation[]
  >([]);

  const [total, setTotal] = useState(0);

  const [selectedLocation, setSelectedLocation] =
    useState<InvestigationLocation | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [viewMode, setViewMode] = useState<"split" | "map" | "records">("split");

  const query = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const locationType =
    searchParams.get("type") ?? "All Types";

  const limit = Number(
    searchParams.get("limit") ?? "50",
  );

  const selectedId =
    searchParams.get("selected") ?? "";

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        await locationService.listLocations({
          query,
          city,
          limit,
          offset: 0,
        });

      setLocations(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error(
        "Failed to load locations:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load location intelligence.",
      );
    } finally {
      setLoading(false);
    }
  }, [query, city, limit]);

  const selectLocation = useCallback(
    (location: InvestigationLocation) => {
      setSelectedLocation(location);

      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("selected", location.locationId);
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const closeInspector = useCallback(() => {
    setSelectedLocation(null);

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("selected");
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  // URL selection sync — reuse in-memory record first, fetch by ID only if not present in active page
  useEffect(() => {
    if (!selectedId) {
      setSelectedLocation(null);
      return;
    }

    if (selectedLocation?.locationId === selectedId) {
      return;
    }

    const existing = locations.find(
      (location) => location.locationId === selectedId,
    );

    if (existing) {
      setSelectedLocation(existing);
    } else {
      setDetailLoading(true);
      void locationService
        .getLocationById(selectedId)
        .then((detail) => {
          if (detail) setSelectedLocation(detail);
        })
        .catch((err) => {
          console.error("Failed to load location detail:", err);
        })
        .finally(() => {
          setDetailLoading(false);
        });
    }
  }, [selectedId, locations, selectedLocation?.locationId]);

  const filteredLocations = useMemo(() => {
    if (
      !locationType ||
      locationType === "All Types"
    ) {
      return locations;
    }

    return locations.filter((location) => {
      const type =
        location.metadata?.locationType;

      return (
        typeof type === "string" &&
        type.toLowerCase() ===
          locationType.toLowerCase()
      );
    });
  }, [locations, locationType]);

  const summary: Summary = useMemo(
    () =>
      locationService.getHotspotSummary(
        filteredLocations,
        total,
      ),
    [filteredLocations, total],
  );

  const applyFilters = (filters: {
    query: string;
    city: string;
    locationType: string;
    limit: number;
  }) => {
    const next = new URLSearchParams();

    if (filters.query) {
      next.set("q", filters.query);
    }

    if (filters.city) {
      next.set("city", filters.city);
    }

    if (
      filters.locationType &&
      filters.locationType !== "All Types"
    ) {
      next.set("type", filters.locationType);
    }

    next.set(
      "limit",
      String(filters.limit),
    );

    setSelectedLocation(null);
    setSearchParams(next);
  };

  return (
    <div className="location-page">
      <header className="location-page-header">
        <div>
          <span className="eyebrow">
            SANDHAAN / INVESTIGATION
          </span>

          <h1>Location Intelligence</h1>

          <p>
            Geospatial intelligence across
            investigation datasets.
          </p>
        </div>

        <div className="location-header-actions">
          <div className="location-view-toggles">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
              title="Split View (Map & Records)"
            >
              SPLIT
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "map" ? "active" : ""}`}
              onClick={() => setViewMode("map")}
              title="Map View Only"
            >
              MAP
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "records" ? "active" : ""}`}
              onClick={() => setViewMode("records")}
              title="Records View Only"
            >
              RECORDS
            </button>
          </div>

          <div className="location-status">
            <span className="status-dot" />
            NEONDB CONNECTED
          </div>
        </div>
      </header>

      <LocationFilters
        query={query}
        city={city}
        locationType={locationType}
        limit={limit}
        onApply={applyFilters}
        onRefresh={() => void loadLocations()}
      />

      <HotspotSummary summary={summary} />

      {error && (
        <div className="location-error">
          <strong>LOCATION INTELLIGENCE ERROR</strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={() => void loadLocations()}
          >
            RETRY
          </button>
        </div>
      )}

      <main className={`location-workspace location-workspace--${viewMode}`}>
        {viewMode !== "records" && (
          <section className="location-map-panel">
            {loading ? (
              <div className="location-loading">
                <div className="loading-spinner" />
                <span>
                  Loading geospatial intelligence...
                </span>
              </div>
            ) : (
              <LocationMap
                locations={filteredLocations}
                selectedLocationId={
                  selectedLocation?.locationId ??
                  selectedId
                }
                onSelect={selectLocation}
              />
            )}
          </section>
        )}

        {viewMode !== "map" && (
          <section className="location-list-panel">
            <div className="location-list-header">
              <div>
                <span className="eyebrow">
                  LOCATION RECORDS
                </span>

                <h2>
                  {filteredLocations.length} visible
                </h2>
              </div>

              <span>
                {total.toLocaleString()} total
              </span>
            </div>

            <div className="location-list">
              {!loading &&
                filteredLocations.map((location) => (
                  <LocationCard
                    key={location.locationId}
                    location={location}
                    selected={
                      selectedLocation?.locationId ===
                      location.locationId
                    }
                    onClick={() =>
                      void selectLocation(location)
                    }
                  />
                ))}

              {!loading &&
                filteredLocations.length === 0 && (
                  <div className="location-empty">
                    <strong>
                      NO LOCATIONS FOUND
                    </strong>

                    <span>
                      Adjust the investigation filters
                      and try again.
                    </span>
                  </div>
                )}
            </div>
          </section>
        )}
      </main>

      <LocationInspector
        location={selectedLocation}
        loading={detailLoading}
        onClose={closeInspector}
      />
    </div>
  );
}
