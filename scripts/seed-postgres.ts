import "reflect-metadata";
import ormDataSource from "../ormconfig";
import { EntityResolutionCandidateEntity } from "../lib/db/entities/entity-resolution-candidate.entity";
import { ExtractionEventEntity } from "../lib/db/entities/extraction-event.entity";
import { DocumentRepository } from "../lib/documents/document-repository";
import { scoreEntityCandidate } from "../lib/entity-resolution/score";
import { leaseExtractionExample } from "../lib/graph/sample-data";
import { corpusDocuments } from "../lib/rag/corpus";

async function main() {
  const dataSource = await ormDataSource.initialize();
  const documentRepository = new DocumentRepository(dataSource);

  for (const document of corpusDocuments) {
    await documentRepository.upsert({
      id: document.id,
      title: document.title,
      sourceType: document.sourceType,
      chunks: document.chunks.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        entityRefs: chunk.entityRefs
      }))
    });
  }

  await dataSource.getRepository(ExtractionEventEntity).save(
    dataSource.getRepository(ExtractionEventEntity).create({
      id: "extract-lease-northstar-2024",
      documentId: leaseExtractionExample.documentId,
      extractorName: "local-structured-lease-extractor",
      confidence: leaseExtractionExample.confidence.toFixed(4),
      extractedPayload: leaseExtractionExample.fields,
      reviewed: true
    })
  );

  const candidate = scoreEntityCandidate({
    sourceName: "Northstar Logistics LLC",
    candidateName: "Northstar Logistics",
    sharedLeaseId: true,
    sharedAddress: true
  });

  await dataSource.getRepository(EntityResolutionCandidateEntity).save(
    dataSource.getRepository(EntityResolutionCandidateEntity).create({
      id: "resolve-northstar",
      sourceName: "Northstar Logistics LLC",
      candidateName: "Northstar Logistics",
      score: candidate.score.toFixed(4),
      decision: candidate.decision,
      signals: candidate.signals
    })
  );

  console.log("Seeded Postgres documents, embeddings, extraction events, and entity resolution candidates.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (ormDataSource.isInitialized) {
      await ormDataSource.destroy();
    }
  });
