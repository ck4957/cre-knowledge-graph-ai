import { NextResponse } from "next/server";
import { z } from "zod";
import { getNeo4jDriver } from "@/lib/db/neo4j";
import { getRuntimeEnv } from "@/lib/db/env";
import { getAppDataSource } from "@/lib/db/typeorm";
import { getTenantImpact } from "@/lib/graph/neo4j-repository";
import { buildGraphAugmentedAnswer, detectTenantName } from "@/lib/rag/answer";
import { retrieveFromDatabase, retrieveFromLocalCorpus } from "@/lib/rag/retriever";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  question: z.string().min(3).max(500)
});

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json());
  const env = getRuntimeEnv();
  const tenantName = detectTenantName(body.question);

  try {
    const citations = await retrieveFromDatabase(await getAppDataSource(), body.question, env.RAG_TOP_K);
    const graphFacts = await getTenantImpact(getNeo4jDriver(), tenantName);

    return NextResponse.json(buildGraphAugmentedAnswer(body.question, citations, graphFacts, "database"));
  } catch (error) {
    const citations = retrieveFromLocalCorpus(body.question, env.RAG_TOP_K);

    return NextResponse.json({
      ...buildGraphAugmentedAnswer(body.question, citations, [], "in-memory"),
      warning: error instanceof Error ? error.message : "Database-backed RAG unavailable."
    });
  }
}
