export type MlsPropertyListing = {
  listingKey: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  listPrice?: number;
  modificationTimestamp?: string;
  raw: Record<string, unknown>;
};

export type MlsSearchCriteria = {
  city?: string;
  state?: string;
  updatedAfter?: string;
  limit?: number;
};

export interface MlsDataSource {
  searchProperties(criteria: MlsSearchCriteria): Promise<MlsPropertyListing[]>;
}

