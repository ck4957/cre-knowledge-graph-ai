import { afterEach, describe, expect, it } from "vitest";
import { getRuntimeEnv } from "@/lib/db/env";

const originalEnv = { ...process.env };

describe("runtime environment parsing", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("normalizes empty optional URL and secret values from Docker env", () => {
    process.env.EMBEDDING_API_URL = "";
    process.env.EMBEDDING_API_KEY = "";
    process.env.EMBEDDING_RESPONSE_PATH = "";
    process.env.RESO_WEB_API_BASE_URL = "";

    expect(getRuntimeEnv()).toEqual(
      expect.objectContaining({
        EMBEDDING_PROVIDER: "deterministic",
        EMBEDDING_API_URL: undefined,
        EMBEDDING_API_KEY: undefined,
        EMBEDDING_RESPONSE_PATH: "embedding",
        RESO_WEB_API_BASE_URL: undefined
      })
    );
  });
});
