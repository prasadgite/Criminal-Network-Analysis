import { apiClient } from '@/services/api/apiClient';
import type { InvestigationEvidence, EvidenceType } from '../evidence';

export interface EvidenceQueryParams {
  caseId?: string;
  type?: EvidenceType;
  limit?: number;
  offset?: number;
}

export class EvidenceDomainService {
  async list(params: EvidenceQueryParams = {}): Promise<{
    data: InvestigationEvidence[];
    total: number;
  }> {
    return apiClient.get('/api/intelligence/evidence', {
      caseId: params.caseId,
      type: params.type,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    });
  }

  async getById(evidenceId: string): Promise<InvestigationEvidence | null> {
    return apiClient.get(`/api/intelligence/evidence/${encodeURIComponent(evidenceId)}`);
  }
}

export const evidenceDomainService = new EvidenceDomainService();
