import { apiClient } from '@/services/api/apiClient';
import type { EntityRelationship, RelationshipType } from '../relationship';

export interface RelationshipQueryParams {
  entityId?: string;
  type?: RelationshipType;
  limit?: number;
}

export class RelationshipDomainService {
  async getRelationships(params: RelationshipQueryParams = {}): Promise<{
    data: EntityRelationship[];
    total: number;
  }> {
    return apiClient.get('/api/intelligence/relationships', {
      entityId: params.entityId,
      type: params.type,
      limit: params.limit ?? 50,
    });
  }

  async getNetworkGraph(
    entityId: string,
    depth: number = 2,
  ): Promise<{ nodes: any[]; edges: any[] }> {
    return apiClient.get(`/api/intelligence/relationships/graph/${encodeURIComponent(entityId)}`, {
      depth,
    });
  }
}

export const relationshipDomainService = new RelationshipDomainService();
