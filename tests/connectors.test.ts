import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleMapsGeocodingClient } from "@/lib/connectors/maps/google-maps-client";
import { ResoWebApiClient } from "@/lib/connectors/mls/reso-web-api-client";

describe("ResoWebApiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps RESO property payloads into normalized listings", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          value: [
            {
              ListingKey: "L-1",
              UnparsedAddress: "100 Main St",
              City: "Buffalo",
              StateOrProvince: "NY",
              Latitude: 42.1,
              Longitude: -78.8,
              PropertyType: "Commercial"
            }
          ]
        })
      }))
    );

    const client = new ResoWebApiClient({
      baseUrl: "https://idx.example.test/reso/",
      accessToken: "token"
    });
    const listings = await client.searchProperties({ city: "Buffalo", state: "NY", limit: 1 });

    expect(listings[0]).toMatchObject({
      listingKey: "L-1",
      address: "100 Main St",
      city: "Buffalo",
      state: "NY"
    });
    const [requestUrl, requestInit] = vi.mocked(fetch).mock.calls[0];
    expect(String(requestUrl)).toContain("%24filter=City+eq");
    expect(requestInit).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" })
      })
    );
  });
});

describe("GoogleMapsGeocodingClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns normalized geocoding results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          results: [
            {
              formatted_address: "100 Main St, Buffalo, NY",
              place_id: "place-1",
              geometry: { location: { lat: 42.1, lng: -78.8 } }
            }
          ]
        })
      }))
    );

    const client = new GoogleMapsGeocodingClient("maps-key");
    const result = await client.geocode("100 Main St Buffalo NY");

    expect(result).toMatchObject({
      formattedAddress: "100 Main St, Buffalo, NY",
      latitude: 42.1,
      longitude: -78.8,
      placeId: "place-1"
    });
  });
});
