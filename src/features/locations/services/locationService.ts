import {
  locationDomainService,
  type LocationQueryParams,
} from "@/domain/investigation/services/locationDomainService";

import type { InvestigationLocation } from "@/domain/investigation/location";

export interface LocationListParams {
  query?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface LocationListResult {
  data: InvestigationLocation[];
  total: number;
}

export interface HotspotSummary {
  totalLocations: number;
  activeAreas: number;
  highSensitivity: number;
  mediumSensitivity: number;
  lowSensitivity: number;
  unknownSensitivity: number;
  topArea?: string;
  topLocationType?: string;
}

class LocationService {
  async listLocations(
    params: LocationListParams = {},
  ): Promise<LocationListResult> {
    const query: LocationQueryParams = {
      query: params.query,
      city: params.city,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    };

    return locationDomainService.list(query);
  }

  async getLocationById(
    locationId: string,
  ): Promise<InvestigationLocation | null> {
    return locationDomainService.getById(locationId);
  }

  getHotspotSummary(
    locations: InvestigationLocation[],
    totalLocations = locations.length,
  ): HotspotSummary {
    const areaCounts = new Map<string, number>();
    const typeCounts = new Map<string, number>();

    let highSensitivity = 0;
    let mediumSensitivity = 0;
    let lowSensitivity = 0;
    let unknownSensitivity = 0;

    for (const location of locations) {
      const metadata = location.metadata ?? {};

      const area =
        typeof metadata.area === "string"
          ? metadata.area
          : location.city ?? "Unknown";

      const type =
        typeof metadata.locationType === "string"
          ? metadata.locationType
          : "Unknown";

      const sensitivity =
        typeof metadata.sensitivityLevel === "string"
          ? metadata.sensitivityLevel.toLowerCase()
          : "unknown";

      areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);

      if (sensitivity === "high") {
        highSensitivity++;
      } else if (sensitivity === "medium") {
        mediumSensitivity++;
      } else if (sensitivity === "low") {
        lowSensitivity++;
      } else {
        unknownSensitivity++;
      }
    }

    const topArea = [...areaCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const topLocationType = [...typeCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    return {
      totalLocations,
      activeAreas: areaCounts.size,
      highSensitivity,
      mediumSensitivity,
      lowSensitivity,
      unknownSensitivity,
      topArea,
      topLocationType,
    };
  }
}

export const locationService = new LocationService();
