import { NextResponse } from "next/server";
import { getNeo4jDriver } from "@/lib/db/neo4j";
import { DocumentChunkEntity } from "@/lib/db/entities/document-chunk.entity";
import { getAppDataSource } from "@/lib/db/typeorm";
import { getGraphHealth } from "@/lib/graph/neo4j-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  try {
    const dataSource = await getAppDataSource();
    const chunks = await dataSource.getRepository(DocumentChunkEntity).count();
    checks.postgres = { ok: true, chunks };
  } catch (error) {
    checks.postgres = { ok: false, error: error instanceof Error ? error.message : "Unknown Postgres error" };
  }

  try {
    checks.neo4j = { ok: true, ...(await getGraphHealth(getNeo4jDriver())) };
  } catch (error) {
    checks.neo4j = { ok: false, error: error instanceof Error ? error.message : "Unknown Neo4j error" };
  }

  return NextResponse.json(checks);
}
