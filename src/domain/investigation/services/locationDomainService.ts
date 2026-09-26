import { apiClient } from '@/services/api/apiClient';
import type { InvestigationLocation } from '../location';

export interface LocationQueryParams {
  city?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export class LocationDomainService {
  async list(params: LocationQueryParams = {}): Promise<{
    data: InvestigationLocation[];
    total: number;
  }> {
    return apiClient.get('/api/intelligence/locations', {
      city: params.city,
      q: params.query,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    });
  }

  async getById(locationId: string): Promise<InvestigationLocation | null> {
    return apiClient.get(`/api/intelligence/locations/${encodeURIComponent(locationId)}`);
  }
}

export const locationDomainService = new LocationDomainService();
