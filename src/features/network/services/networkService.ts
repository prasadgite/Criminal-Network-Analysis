import {
  relationshipDomainService,
} from '@/domain/investigation/services/relationshipDomainService';

import type {
  EntityRelationship,
  RelationshipType,
} from '@/domain/investigation/relationship';

export interface NetworkNode {
  id: string;
  label: string;
  type: string;
  isRoot?: boolean;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight?: number;
  metadata?: Record<string, any>;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface NetworkRelationshipParams {
  entityId?: string;
  type?: RelationshipType;
  limit?: number;
}

class NetworkService {
  async getRelationships(
    params: NetworkRelationshipParams = {},
  ): Promise<{
    data: EntityRelationship[];
    total: number;
  }> {
    return relationshipDomainService.getRelationships({
      entityId: params.entityId,
      type: params.type,
      limit: params.limit ?? 100,
    });
  }

  async getGraph(
    entityId: string,
    depth: number = 2,
  ): Promise<NetworkGraph> {
    return relationshipDomainService.getNetworkGraph(entityId, depth);
  }

  async getNetwork(
    entityId: string,
    options: {
      depth?: number;
      relationshipType?: RelationshipType;
      limit?: number;
    } = {},
  ) {
    const [graph, relationships] = await Promise.all([
      this.getGraph(entityId, options.depth ?? 2),
      this.getRelationships({
        entityId,
        type: options.relationshipType,
        limit: options.limit ?? 100,
      }),
    ]);

    return {
      graph,
      relationships: relationships.data,
      totalRelationships: relationships.total,
    };
  }
}

export const networkService = new NetworkService();
