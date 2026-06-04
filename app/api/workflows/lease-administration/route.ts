import { NextResponse } from "next/server";
import { z } from "zod";
import { getNeo4jDriver } from "@/lib/db/neo4j";
import { getRuntimeEnv } from "@/lib/db/env";
import { getAppDataSource } from "@/lib/db/typeorm";
import {
  runDatabaseLeaseAdministrationWorkflow,
  runLocalLeaseAdministrationWorkflow
} from "@/lib/workflows/lease-administration";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  question: z.string().min(3).max(500).default("What lease administration work is needed for Northstar?"),
  tenantName: z.string().min(1).max(200).optional()
});

export async function POST(request: Request) {
  const body = requestSchema.parse(await request.json().catch(() => ({})));
  const env = getRuntimeEnv();

  try {
    const workflow = await runDatabaseLeaseAdministrationWorkflow({
      dataSource: await getAppDataSource(),
      graphDriver: getNeo4jDriver(),
      question: body.question,
      tenantName: body.tenantName,
      topK: env.RAG_TOP_K
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    const workflow = runLocalLeaseAdministrationWorkflow({
      question: body.question,
      tenantName: body.tenantName,
      topK: env.RAG_TOP_K
    });

    return NextResponse.json({
      workflow,
      warning: error instanceof Error ? error.message : "Database-backed workflow unavailable."
    });
  }
}
