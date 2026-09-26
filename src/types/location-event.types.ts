export interface LocationEvent {
  eventId: string;

  entityId: string;
  entityType: string;

  locationId: string;

  timestamp: string;

  eventType?: string;

  durationMinutes?: number;

  latitude?: number;
  longitude?: number;

  source?: string;

  confidence?: number;
}
