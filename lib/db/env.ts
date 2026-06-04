import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());
const optionalString = z.preprocess((value) => (value === "" ? undefined : value), z.string().optional());

const envSchema = z.object({
  DATABASE_URL: optionalUrl,
  NEO4J_URI: optionalString,
  NEO4J_USERNAME: optionalString,
  NEO4J_PASSWORD: optionalString,
  RESO_WEB_API_BASE_URL: optionalUrl,
  RESO_WEB_API_ACCESS_TOKEN: optionalString,
  GOOGLE_MAPS_API_KEY: optionalString,
  EMBEDDING_PROVIDER: z.enum(["deterministic", "http"]).default("deterministic"),
  EMBEDDING_API_URL: optionalUrl,
  EMBEDDING_API_KEY: optionalString,
  EMBEDDING_MODEL: optionalString,
  EMBEDDING_RESPONSE_PATH: z.preprocess((value) => (value === "" ? undefined : value), z.string().default("embedding")),
  RAG_TOP_K: z.coerce.number().int().positive().default(4)
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export function getRuntimeEnv(): RuntimeEnv {
  return envSchema.parse(process.env);
}
