import "reflect-metadata";
import { DataSource } from "typeorm";
import { DocumentChunkEntity } from "@/lib/db/entities/document-chunk.entity";
import { EntityResolutionCandidateEntity } from "@/lib/db/entities/entity-resolution-candidate.entity";
import { ExtractionEventEntity } from "@/lib/db/entities/extraction-event.entity";
import { SourceDocumentEntity } from "@/lib/db/entities/source-document.entity";
import { CreateKnowledgeGraphSchema1717450000000 } from "@/lib/db/migrations/1717450000000-CreateKnowledgeGraphSchema";

export const appDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL ?? "postgres://cre:cre@localhost:5432/cre_kg",
  entities: [SourceDocumentEntity, DocumentChunkEntity, ExtractionEventEntity, EntityResolutionCandidateEntity],
  migrations: [CreateKnowledgeGraphSchema1717450000000],
  synchronize: false,
  logging: false
});
