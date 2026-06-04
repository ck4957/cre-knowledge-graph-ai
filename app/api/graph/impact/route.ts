import { NextResponse } from "next/server";
import { getNeo4jDriver } from "@/lib/db/neo4j";
import { getTenantImpact } from "@/lib/graph/neo4j-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenant = url.searchParams.get("tenant") ?? "Northstar Logistics";
  const facts = await getTenantImpact(getNeo4jDriver(), tenant);

  return NextResponse.json({ tenant, facts });
}

