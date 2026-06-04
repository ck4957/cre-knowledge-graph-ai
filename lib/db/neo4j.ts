import neo4j, { type Driver } from "neo4j-driver";
import { getRuntimeEnv } from "./env";

let driver: Driver | undefined;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const env = getRuntimeEnv();

    if (!env.NEO4J_URI || !env.NEO4J_USERNAME || !env.NEO4J_PASSWORD) {
      throw new Error("NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD are required for graph traversal.");
    }

    driver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USERNAME, env.NEO4J_PASSWORD));
  }

  return driver;
}

