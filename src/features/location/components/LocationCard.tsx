import type { InvestigationLocation } from "@/domain/investigation/location";

interface LocationCardProps {
  location: InvestigationLocation;
  selected: boolean;
  onClick: () => void;
}

function getMetadata(
  location: InvestigationLocation,
  key: string,
) {
  return location.metadata?.[key];
}

export default function LocationCard({
  location,
  selected,
  onClick,
}: LocationCardProps) {
  const locationType =
    getMetadata(location, "locationType") ?? "Unknown";

  const sensitivity =
    getMetadata(location, "sensitivityLevel") ?? "Unknown";

  return (
    <button
      type="button"
      className={`location-card ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="location-card-top">
        <span className="location-id">
          {location.locationId}
        </span>

        <span
          className={`sensitivity sensitivity-${String(
            sensitivity,
          ).toLowerCase()}`}
        >
          {String(sensitivity)}
        </span>
      </div>

      <div className="location-card-name">
        {location.name ?? "Unnamed location"}
      </div>

      <div className="location-card-type">
        {String(locationType)}
      </div>

      {location.address && (
        <div className="location-card-address">
          {location.address}
        </div>
      )}

      <div className="location-card-footer">
        <span>
          {location.latitude?.toFixed(5)},{" "}
          {location.longitude?.toFixed(5)}
        </span>

        <span>
          OPEN DETAIL →
        </span>
      </div>
    </button>
  );
}
