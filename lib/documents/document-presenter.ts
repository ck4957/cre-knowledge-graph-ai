import type { SourceDocumentEntity } from "@/lib/db/entities/source-document.entity";
import type { DocumentChunkEntity } from "@/lib/db/entities/document-chunk.entity";

export function presentDocument(document: SourceDocumentEntity) {
  return {
    id: document.id,
    title: document.title,
    sourceType: document.sourceType,
    sourceUri: document.sourceUri,
    createdAt: document.createdAt,
    chunks:
      (document.chunks as DocumentChunkEntity[] | undefined)?.map((chunk) => ({
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        entityRefs: chunk.entityRefs
      })) ?? []
  };
}
