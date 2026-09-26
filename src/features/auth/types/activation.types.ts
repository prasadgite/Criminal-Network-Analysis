export interface ActivationStatus {
  investigatorId: string;
  displayName: string;
  email?: string;
  role: string;
  clearanceLevel?: string;
  status: string;
  activationRequired: boolean;
  activationCredentialExpired: boolean;
  activationLocked: boolean;
}

export interface ActivationResponse {
  activated: boolean;
  investigator: {
    investigator_id: string;
    full_name: string;
    email: string;
    role: string;
    clearance_level: string;
    status: string;
  };
  nextStep: "LOGIN";
  message: string;
}
