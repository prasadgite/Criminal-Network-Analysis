import type { LocationEvent } from "@/types";

export const mockLocationEvents: LocationEvent[] = [
  {
    eventId: "LE-10001",
    entityId: "PH-2001",
    entityType: "phone",
    locationId: "LOC-5001",
    timestamp: "2026-09-15T09:10:00+05:30",
    eventType: "cell_presence",
    durationMinutes: 12,
    latitude: 18.5074,
    longitude: 73.8077,
    source: "MVP_SYNTHETIC",
    confidence: 0.92,
  },

  {
    eventId: "LE-10002",
    entityId: "PH-2002",
    entityType: "phone",
    locationId: "LOC-5002",
    timestamp: "2026-09-15T11:40:00+05:30",
    eventType: "cell_presence",
    durationMinutes: 18,
    latitude: 18.4966,
    longitude: 73.9419,
    source: "MVP_SYNTHETIC",
    confidence: 0.91,
  },
];
