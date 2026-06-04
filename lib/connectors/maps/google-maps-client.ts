import type { GeocodeResult, MapsDataSource } from "./types";

export class GoogleMapsGeocodingClient implements MapsDataSource {
  constructor(private readonly apiKey: string) {}

  async geocode(address: string): Promise<GeocodeResult | null> {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", this.apiKey);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Maps geocoding request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: Array<{
        formatted_address?: string;
        place_id?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
      } & Record<string, unknown>>;
    };
    const first = payload.results?.[0];

    if (!first?.geometry?.location?.lat || !first.geometry.location.lng) {
      return null;
    }

    return {
      formattedAddress: first.formatted_address ?? address,
      latitude: first.geometry.location.lat,
      longitude: first.geometry.location.lng,
      placeId: first.place_id,
      raw: first
    };
  }
}

