export type VehicleStatus = "active" | "inactive" | "unknown";

export type InsuranceStatus = "active" | "expired" | "unknown";

export interface Vehicle {
  vehicleId: string;

  registrationNumber: string;

  vehicleType?: string;
  make?: string;
  model?: string;
  color?: string;

  registrationDate?: string;

  registeredOwnerId?: string;
  currentOwnerId?: string;

  status?: VehicleStatus;
  insuranceStatus?: InsuranceStatus;

  source?: string;
}
