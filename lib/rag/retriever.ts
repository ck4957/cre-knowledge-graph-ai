import type { DataSource } from "typeorm";
import { DocumentChunkEntity } from "@/lib/db/entities/document-chunk.entity";
import { SourceDocumentEntity } from "@/lib/db/entities/source-document.entity";
import { corpusDocuments } from "./corpus";
import { cosineSimilarity, embedText, vectorLiteral } from "./embedding";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  title: string;
  content: string;
  entityRefs: string[];
  score: number;
};

export async function retrieveFromDatabase(dataSource: DataSource, question: string, topK: number): Promise<RetrievedChunk[]> {
  const queryEmbedding = embedText(question);
  const chunks = await dataSource.getRepository(DocumentChunkEntity).find();
  const documentIds = [...new Set(chunks.map((chunk) => chunk.documentId))];
  const documents = await dataSource.getRepository(SourceDocumentEntity).findBy(documentIds.map((id) => ({ id })));
  const documentTitles = new Map(documents.map((document) => [document.id, document.title]));

  return rankChunks(
    chunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      title: documentTitles.get(chunk.documentId) ?? chunk.documentId,
      content: chunk.content,
      entityRefs: chunk.entityRefs,
      embedding: chunk.embedding
    })),
    queryEmbedding,
    topK
  );
}

export function retrieveFromLocalCorpus(question: string, topK: number): RetrievedChunk[] {
  const queryEmbedding = embedText(question);

  return corpusDocuments
    .flatMap((document) =>
      document.chunks.map((chunk) => ({
        id: chunk.id,
        documentId: document.id,
        title: document.title,
        content: chunk.content,
        entityRefs: chunk.entityRefs,
        score: cosineSimilarity(queryEmbedding, embedText(chunk.content))
      }))
    )
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}

export function rankChunks(
  chunks: Array<Omit<RetrievedChunk, "score"> & { embedding: number[] }>,
  queryEmbedding: number[],
  topK: number
): RetrievedChunk[] {
  return chunks
    .map(({ embedding, ...chunk }) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, embedding)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}
