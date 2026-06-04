import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEO4J_URI: z.string().optional(),
  NEO4J_USERNAME: z.string().optional(),
  NEO4J_PASSWORD: z.string().optional(),
  RESO_WEB_API_BASE_URL: z.string().url().optional(),
  RESO_WEB_API_ACCESS_TOKEN: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  RAG_TOP_K: z.coerce.number().int().positive().default(4)
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export function getRuntimeEnv(): RuntimeEnv {
  return envSchema.parse(process.env);
}
