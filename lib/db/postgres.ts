import { Pool } from "pg";
import { getRuntimeEnv } from "./env";

let pool: Pool | undefined;

export function getPostgresPool(): Pool {
  if (!pool) {
    const env = getRuntimeEnv();

    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for Postgres-backed RAG.");
    }

    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 5
    });
  }

  return pool;
}

