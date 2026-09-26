import { apiClient } from '@/services/api/apiClient';
import type { InvestigationFinding } from '../finding';

export interface FindingQueryParams {
  caseId?: string;
  limit?: number;
}

export class FindingDomainService {
  async getFindings(params: FindingQueryParams = {}): Promise<{
    data: InvestigationFinding[];
    total: number;
  }> {
    return apiClient.get('/api/intelligence/findings', {
      caseId: params.caseId,
      limit: params.limit ?? 30,
    });
  }
}

export const findingDomainService = new FindingDomainService();
