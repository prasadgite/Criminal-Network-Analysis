import type { Location } from "@/types";

export const mockLocations: Location[] = [
  {
    locationId: "LOC-5001",
    locationName: "Kothrud Junction",
    locationType: "intersection",
    address: "Kothrud, Pune",
    area: "Kothrud",
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411038",
    latitude: 18.5074,
    longitude: 73.8077,
    sensitivityLevel: "normal",
  },

  {
    locationId: "LOC-5002",
    locationName: "Hadapsar Industrial Area",
    locationType: "industrial",
    address: "Hadapsar, Pune",
    area: "Hadapsar",
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    latitude: 18.4966,
    longitude: 73.9419,
    sensitivityLevel: "medium",
  },

  {
    locationId: "LOC-5003",
    locationName: "Wakad Commercial Zone",
    locationType: "commercial",
    address: "Wakad, Pune",
    area: "Wakad",
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411057",
    latitude: 18.5993,
    longitude: 73.7625,
    sensitivityLevel: "normal",
  },
];
