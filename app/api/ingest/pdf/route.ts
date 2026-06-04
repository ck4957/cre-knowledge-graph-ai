import { NextResponse } from "next/server";
import { PdfDocumentParser } from "@/lib/connectors/documents/pdf-parser";
import { getAppDataSource } from "@/lib/db/typeorm";
import { DocumentRepository } from "@/lib/documents/document-repository";
import { presentDocument } from "@/lib/documents/document-presenter";
import { DocumentIngestionService } from "@/lib/ingestion/document-ingestion-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Multipart field 'file' is required." }, { status: 400 });
  }

  const parser = new PdfDocumentParser();
  const parsed = await parser.parse(Buffer.from(await file.arrayBuffer()), file.name);
  const service = new DocumentIngestionService(new DocumentRepository(await getAppDataSource()));
  const document = await service.ingestTextDocument({
    id: `pdf-${crypto.randomUUID()}`,
    title: parsed.title,
    sourceType: "pdf_upload",
    sourceUri: file.name,
    text: parsed.text
  });

  return NextResponse.json(
    {
      document: presentDocument(document),
      metadata: parsed.metadata
    },
    { status: 201 }
  );
}

