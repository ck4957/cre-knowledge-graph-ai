import { Pool } from "pg";
import { scoreEntityCandidate } from "../lib/entity-resolution/score";
import { leaseExtractionExample } from "../lib/graph/sample-data";
import { corpusDocuments } from "../lib/rag/corpus";
import { embedText, vectorLiteral } from "../lib/rag/embedding";

const connectionString = process.env.DATABASE_URL ?? "postgres://cre:cre@localhost:5432/cre_kg";
const pool = new Pool({ connectionString });

async function main() {
  for (const document of corpusDocuments) {
    await pool.query(
      `
      INSERT INTO source_documents (id, title, source_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, source_type = EXCLUDED.source_type
      `,
      [document.id, document.title, document.sourceType]
    );

    for (const [index, chunk] of document.chunks.entries()) {
      await pool.query(
        `
        INSERT INTO document_chunks (id, document_id, chunk_index, content, entity_refs, embedding)
        VALUES ($1, $2, $3, $4, $5, $6::vector)
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          entity_refs = EXCLUDED.entity_refs,
          embedding = EXCLUDED.embedding
        `,
        [chunk.id, document.id, index, chunk.content, chunk.entityRefs, vectorLiteral(embedText(chunk.content))]
      );
    }
  }

  await pool.query(
    `
    INSERT INTO extraction_events (id, document_id, extractor_name, confidence, extracted_payload, reviewed)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      confidence = EXCLUDED.confidence,
      extracted_payload = EXCLUDED.extracted_payload,
      reviewed = EXCLUDED.reviewed
    `,
    [
      "extract-lease-northstar-2024",
      leaseExtractionExample.documentId,
      "local-structured-lease-extractor",
      leaseExtractionExample.confidence,
      JSON.stringify(leaseExtractionExample.fields),
      true
    ]
  );

  const candidate = scoreEntityCandidate({
    sourceName: "Northstar Logistics LLC",
    candidateName: "Northstar Logistics",
    sharedLeaseId: true,
    sharedAddress: true
  });

  await pool.query(
    `
    INSERT INTO entity_resolution_candidates (id, source_name, candidate_name, score, decision, signals)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      score = EXCLUDED.score,
      decision = EXCLUDED.decision,
      signals = EXCLUDED.signals
    `,
    [
      "resolve-northstar",
      "Northstar Logistics LLC",
      "Northstar Logistics",
      candidate.score,
      candidate.decision,
      candidate.signals
    ]
  );

  console.log("Seeded Postgres documents, embeddings, extraction events, and entity resolution candidates.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

