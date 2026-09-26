import { apiClient } from "@/services/api/apiClient";
import type {
  ActivationResponse,
  ActivationStatus,
} from "../types/activation.types";

export interface ActivateAccountPayload {
  investigatorId: string;
  activationCode: string;
  newPassword: string;
}

class ActivationService {
  async getStatus(investigatorId: string): Promise<ActivationStatus> {
    return apiClient.get("/api/auth/activation/status", {
      investigatorId,
    });
  }

  async activate(
    payload: ActivateAccountPayload,
  ): Promise<ActivationResponse> {
    return apiClient.post("/api/auth/activation", payload);
  }
}

export const activationService = new ActivationService();
