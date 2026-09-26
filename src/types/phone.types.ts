export type PhoneStatus = "active" | "inactive" | "unknown";

export interface Phone {
  phoneId: string;

  phoneNumber: string;
  countryCode?: string;

  carrier?: string;
  circle?: string;

  activationDate?: string;
  deactivationDate?: string;

  phoneStatus?: PhoneStatus;

  registeredPersonId?: string;

  source?: string;
}
