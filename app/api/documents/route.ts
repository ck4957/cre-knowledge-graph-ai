import { NextResponse } from "next/server";
import { getAppDataSource } from "@/lib/db/typeorm";
import { DocumentRepository } from "@/lib/documents/document-repository";
import { createDocumentSchema } from "@/lib/documents/document-schemas";
import { presentDocument } from "@/lib/documents/document-presenter";

export const dynamic = "force-dynamic";

export async function GET() {
  const repository = new DocumentRepository(await getAppDataSource());
  const documents = await repository.list();

  return NextResponse.json({ documents: documents.map(presentDocument) });
}

export async function POST(request: Request) {
  const input = createDocumentSchema.parse(await request.json());
  const repository = new DocumentRepository(await getAppDataSource());
  const document = await repository.create(input);

  return NextResponse.json({ document: presentDocument(document) }, { status: 201 });
}

