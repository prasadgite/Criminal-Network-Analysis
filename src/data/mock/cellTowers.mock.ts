import type { CellTower } from "@/types";

export const mockCellTowers: CellTower[] = [
  {
    cellTowerId: "TOWER-6001",
    towerName: "Kothrud Tower A",
    coverageArea: "Kothrud",
    locationId: "LOC-5001",
    locationName: "Kothrud Junction",
    latitude: 18.5074,
    longitude: 73.8077,
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411038",
    locationMappingMethod: "GPS",
  },

  {
    cellTowerId: "TOWER-6002",
    towerName: "Hadapsar Tower A",
    coverageArea: "Hadapsar",
    locationId: "LOC-5002",
    locationName: "Hadapsar Industrial Area",
    latitude: 18.4966,
    longitude: 73.9419,
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    locationMappingMethod: "GPS",
  },
];
