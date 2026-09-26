export interface Location {
  locationId: string;

  locationName: string;

  locationType?: string;

  address?: string;
  area?: string;

  city?: string;
  district?: string;
  state?: string;
  pincode?: string;

  latitude?: number;
  longitude?: number;

  sensitivityLevel?: string;
}
