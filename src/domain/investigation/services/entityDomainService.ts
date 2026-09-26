import { apiClient } from '@/services/api/apiClient';
import type {
  InvestigationEntity,
  InvestigationEntityType,
} from '../entity';

export interface EntitySearchParams {
  query?: string;
  type?: InvestigationEntityType;
  limit?: number;
  offset?: number;
}

export class EntityDomainService {
  async search(params: EntitySearchParams = {}): Promise<{
    data: InvestigationEntity[];
    total: number;
  }> {
    return apiClient.get('/api/intelligence/entities', {
      q: params.query,
      type: params.type,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    });
  }

  async getById(
    type: InvestigationEntityType,
    id: string,
  ): Promise<InvestigationEntity | null> {
    return apiClient.get(`/api/intelligence/entities/${type}/${encodeURIComponent(id)}`);
  }

  async getCounts(): Promise<Record<string, number>> {
    return apiClient.get('/api/intelligence/entities/counts');
  }
}

export const entityDomainService = new EntityDomainService();
