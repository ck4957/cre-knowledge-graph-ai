import { getRuntimeEnv } from "@/lib/db/env";
import { GoogleMapsGeocodingClient } from "./maps/google-maps-client";
import type { MapsDataSource } from "./maps/types";
import { ResoWebApiClient } from "./mls/reso-web-api-client";
import type { MlsDataSource } from "./mls/types";

export function createMlsDataSource(): MlsDataSource {
  const env = getRuntimeEnv();

  if (!env.RESO_WEB_API_BASE_URL || !env.RESO_WEB_API_ACCESS_TOKEN) {
    throw new Error("RESO_WEB_API_BASE_URL and RESO_WEB_API_ACCESS_TOKEN are required for MLS ingestion.");
  }

  return new ResoWebApiClient({
    baseUrl: env.RESO_WEB_API_BASE_URL,
    accessToken: env.RESO_WEB_API_ACCESS_TOKEN
  });
}

export function createMapsDataSource(): MapsDataSource | undefined {
  const env = getRuntimeEnv();
  return env.GOOGLE_MAPS_API_KEY ? new GoogleMapsGeocodingClient(env.GOOGLE_MAPS_API_KEY) : undefined;
}

