import type { Vehicle } from "@/types";

export const mockVehicles: Vehicle[] = [
  {
    vehicleId: "V-3001",
    registrationNumber: "MH12AB1001",
    vehicleType: "SUV",
    make: "Mahindra",
    model: "XUV500",
    color: "White",
    registrationDate: "2021-06-18",
    registeredOwnerId: "P-1001",
    currentOwnerId: "P-1001",
    status: "active",
    insuranceStatus: "active",
    source: "MVP_SYNTHETIC",
  },

  {
    vehicleId: "V-3002",
    registrationNumber: "MH12CD1002",
    vehicleType: "Sedan",
    make: "Hyundai",
    model: "Verna",
    color: "Black",
    registrationDate: "2020-09-04",
    registeredOwnerId: "P-1002",
    currentOwnerId: "P-1002",
    status: "active",
    insuranceStatus: "active",
    source: "MVP_SYNTHETIC",
  },

  {
    vehicleId: "V-3003",
    registrationNumber: "MH14EF1003",
    vehicleType: "Hatchback",
    make: "Maruti",
    model: "Swift",
    color: "Grey",
    registrationDate: "2022-02-22",
    registeredOwnerId: "P-1003",
    currentOwnerId: "P-1003",
    status: "active",
    insuranceStatus: "active",
    source: "MVP_SYNTHETIC",
  },
];
