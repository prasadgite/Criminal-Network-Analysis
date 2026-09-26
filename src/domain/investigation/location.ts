/**
 * SANDHAAN — Phase 3
 * Investigation Primitive #18
 */

import type { EntityReference } from "./entity";

export interface InvestigationLocation {
  locationId: string;

  name?: string;

  latitude?: number;

  longitude?: number;

  address?: string;

  city?: string;

  district?: string;

  state?: string;

  country?: string;

  entityReferences: EntityReference[];

  caseIds: string[];

  timelineEventIds: string[];

  firstObserved?: string;

  lastObserved?: string;

  sourceDataset?: string;

  sourceRecordId?: string;

  metadata?: Record<string, unknown>;
}
