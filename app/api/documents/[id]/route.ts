import { NextResponse } from "next/server";
import { getAppDataSource } from "@/lib/db/typeorm";
import { DocumentRepository } from "@/lib/documents/document-repository";
import { presentDocument } from "@/lib/documents/document-presenter";
import { updateDocumentSchema } from "@/lib/documents/document-schemas";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const repository = new DocumentRepository(await getAppDataSource());
  const document = await repository.findById(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document: presentDocument(document) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const input = updateDocumentSchema.parse(await request.json());
  const repository = new DocumentRepository(await getAppDataSource());
  const document = await repository.update(id, input);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document: presentDocument(document) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const repository = new DocumentRepository(await getAppDataSource());
  const deleted = await repository.delete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}

