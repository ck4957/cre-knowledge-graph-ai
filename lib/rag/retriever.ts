import type { Pool } from "pg";
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

export async function retrieveFromPostgres(pool: Pool, question: string, topK: number): Promise<RetrievedChunk[]> {
  const embedding = vectorLiteral(embedText(question));
  const result = await pool.query<{
    id: string;
    document_id: string;
    title: string;
    content: string;
    entity_refs: string[];
    score: string;
  }>(
    `
    SELECT
      c.id,
      c.document_id,
      d.title,
      c.content,
      c.entity_refs,
      1 - (c.embedding <=> $1::vector) AS score
    FROM document_chunks c
    JOIN source_documents d ON d.id = c.document_id
    ORDER BY c.embedding <=> $1::vector
    LIMIT $2
    `,
    [embedding, topK]
  );

  return result.rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    title: row.title,
    content: row.content,
    entityRefs: row.entity_refs,
    score: Number(row.score)
  }));
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

