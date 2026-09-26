export interface CellTower {
  cellTowerId: string;

  towerName?: string;

  coverageArea?: string;

  locationId?: string;
  locationName?: string;

  latitude?: number;
  longitude?: number;

  city?: string;
  district?: string;
  state?: string;
  pincode?: string;

  locationMappingMethod?: string;
  mappingNote?: string;
}
