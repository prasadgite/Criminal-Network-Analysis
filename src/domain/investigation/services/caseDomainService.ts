import { apiClient } from '@/services/api/apiClient';
import type { InvestigationCase, CaseStatus, CasePriority } from '../case';

export interface CaseFilterParams {
  status?: CaseStatus;
  priority?: CasePriority;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CaseListResponse {
  data: InvestigationCase[];
  total: number;
}

export class CaseDomainService {
  async list(
    params: CaseFilterParams = {},
  ): Promise<CaseListResponse> {
    return apiClient.get<CaseListResponse>(
      '/api/intelligence/cases',
      {
        status: params.status,
        priority: params.priority,
        search: params.search,
        limit: params.limit ?? 25,
        offset: params.offset ?? 0,
      },
    );
  }

  async getById(
    caseId: string,
  ): Promise<InvestigationCase | null> {
    return apiClient.get<InvestigationCase | null>(
      `/api/intelligence/cases/${encodeURIComponent(caseId)}`,
    );
  }
}

export const caseDomainService = new CaseDomainService();

