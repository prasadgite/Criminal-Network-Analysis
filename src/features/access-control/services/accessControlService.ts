import { apiClient } from '@/services/api/apiClient';
import type {
  AccessRequestQueryParams,
  AccessRequestSummary,
  PaginatedAccessRequests,
  ReviewAccessRequestPayload,
  ReviewResponse,
} from '../types/accessControl';

class AccessControlService {
  async list(params?: AccessRequestQueryParams): Promise<PaginatedAccessRequests> {
    return apiClient.get<PaginatedAccessRequests>(
      '/api/admin/access-requests',
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  async getById(idOrAppNum: string): Promise<AccessRequestSummary> {
    return apiClient.get<AccessRequestSummary>(
      `/api/admin/access-requests/${encodeURIComponent(idOrAppNum)}`,
    );
  }

  async review(
    idOrAppNum: string,
    payload: ReviewAccessRequestPayload,
  ): Promise<ReviewResponse> {
    return apiClient.patch<ReviewResponse, ReviewAccessRequestPayload>(
      `/api/admin/access-requests/${encodeURIComponent(idOrAppNum)}/review`,
      payload,
    );
  }
}

export const accessControlService = new AccessControlService();
