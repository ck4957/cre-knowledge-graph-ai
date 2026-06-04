export type GeocodeResult = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  raw: Record<string, unknown>;
};

export interface MapsDataSource {
  geocode(address: string): Promise<GeocodeResult | null>;
}

