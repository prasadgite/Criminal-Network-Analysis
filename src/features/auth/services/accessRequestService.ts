import { apiClient } from "@/services/api/apiClient";
import type {
  AccessRequestPayload,
  AccessRequestResponse,
  AccessRequestStatusResponse,
} from "../types/authentication";

class AccessRequestService {
  async submit(
    payload: AccessRequestPayload,
  ): Promise<AccessRequestResponse> {
    return apiClient.post<AccessRequestResponse, AccessRequestPayload>(
      "/api/auth/access-requests",
      payload,
    );
  }

  async getStatus(
    applicationNumber: string,
  ): Promise<AccessRequestStatusResponse> {
    return apiClient.get<AccessRequestStatusResponse>(
      `/api/auth/access-requests/${encodeURIComponent(applicationNumber.trim().toUpperCase())}`,
    );
  }
}

export const accessRequestService = new AccessRequestService();
