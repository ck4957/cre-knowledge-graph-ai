import { NextResponse } from "next/server";
import { z } from "zod";
import { createMapsDataSource, createMlsDataSource } from "@/lib/connectors/factory";
import { getAppDataSource } from "@/lib/db/typeorm";
import { DocumentRepository } from "@/lib/documents/document-repository";
import { presentDocument } from "@/lib/documents/document-presenter";
import { DocumentIngestionService } from "@/lib/ingestion/document-ingestion-service";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  updatedAfter: z.string().optional(),
  limit: z.number().int().positive().max(100).optional()
});

export async function POST(request: Request) {
  const criteria = requestSchema.parse(await request.json());
  const service = new DocumentIngestionService(
    new DocumentRepository(await getAppDataSource()),
    createMlsDataSource(),
    createMapsDataSource()
  );
  const documents = await service.ingestMlsListings(criteria);

  return NextResponse.json({ documents: documents.map(presentDocument) }, { status: 201 });
}

