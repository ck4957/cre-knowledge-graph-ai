import type { MlsDataSource, MlsPropertyListing, MlsSearchCriteria } from "./types";

export type ResoWebApiClientOptions = {
  baseUrl: string;
  accessToken: string;
};

export class ResoWebApiClient implements MlsDataSource {
  constructor(private readonly options: ResoWebApiClientOptions) {}

  async searchProperties(criteria: MlsSearchCriteria): Promise<MlsPropertyListing[]> {
    const url = new URL("/Property", this.options.baseUrl);
    url.searchParams.set("$top", String(criteria.limit ?? 25));

    const filters = [
      criteria.city ? `City eq '${escapeOData(criteria.city)}'` : undefined,
      criteria.state ? `StateOrProvince eq '${escapeOData(criteria.state)}'` : undefined,
      criteria.updatedAfter ? `ModificationTimestamp ge ${criteria.updatedAfter}` : undefined
    ].filter(Boolean);

    if (filters.length > 0) {
      url.searchParams.set("$filter", filters.join(" and "));
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.options.accessToken}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`RESO Web API request failed with ${response.status}`);
    }

    const payload = (await response.json()) as { value?: Array<Record<string, unknown>> };
    return (payload.value ?? []).map(mapResoProperty);
  }
}

function mapResoProperty(raw: Record<string, unknown>): MlsPropertyListing {
  return {
    listingKey: String(raw.ListingKey ?? raw.ListingId ?? ""),
    address: String(raw.UnparsedAddress ?? raw.StreetName ?? ""),
    city: String(raw.City ?? ""),
    state: String(raw.StateOrProvince ?? ""),
    postalCode: raw.PostalCode ? String(raw.PostalCode) : undefined,
    latitude: toNumber(raw.Latitude),
    longitude: toNumber(raw.Longitude),
    propertyType: raw.PropertyType ? String(raw.PropertyType) : undefined,
    listPrice: toNumber(raw.ListPrice),
    modificationTimestamp: raw.ModificationTimestamp ? String(raw.ModificationTimestamp) : undefined,
    raw
  };
}

function toNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function escapeOData(value: string): string {
  return value.replaceAll("'", "''");
}

