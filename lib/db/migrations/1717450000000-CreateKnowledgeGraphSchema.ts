import { Table, TableForeignKey, TableIndex, type MigrationInterface, type QueryRunner } from "typeorm";

export class CreateKnowledgeGraphSchema1717450000000 implements MigrationInterface {
  name = "CreateKnowledgeGraphSchema1717450000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "source_documents",
        columns: [
          { name: "id", type: "text", isPrimary: true },
          { name: "title", type: "text" },
          { name: "source_type", type: "text" },
          { name: "source_uri", type: "text", isNullable: true },
          { name: "created_at", type: "timestamptz", default: "now()" }
        ]
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: "document_chunks",
        columns: [
          { name: "id", type: "text", isPrimary: true },
          { name: "document_id", type: "text" },
          { name: "chunk_index", type: "integer" },
          { name: "content", type: "text" },
          { name: "entity_refs", type: "text", isArray: true, default: "'{}'" },
          { name: "embedding", type: "real", isArray: true },
          { name: "created_at", type: "timestamptz", default: "now()" }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      "document_chunks",
      new TableForeignKey({
        columnNames: ["document_id"],
        referencedTableName: "source_documents",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE"
      })
    );

    await queryRunner.createIndex(
      "document_chunks",
      new TableIndex({
        name: "document_chunks_document_id_idx",
        columnNames: ["document_id"]
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "extraction_events",
        columns: [
          { name: "id", type: "text", isPrimary: true },
          { name: "document_id", type: "text" },
          { name: "extractor_name", type: "text" },
          { name: "confidence", type: "numeric", precision: 5, scale: 4 },
          { name: "extracted_payload", type: "jsonb" },
          { name: "reviewed", type: "boolean", default: false },
          { name: "created_at", type: "timestamptz", default: "now()" }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      "extraction_events",
      new TableForeignKey({
        columnNames: ["document_id"],
        referencedTableName: "source_documents",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE"
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "entity_resolution_candidates",
        columns: [
          { name: "id", type: "text", isPrimary: true },
          { name: "source_name", type: "text" },
          { name: "candidate_name", type: "text" },
          { name: "score", type: "numeric", precision: 5, scale: 4 },
          { name: "decision", type: "text" },
          { name: "signals", type: "text", isArray: true, default: "'{}'" },
          { name: "created_at", type: "timestamptz", default: "now()" }
        ]
      }),
      true
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("entity_resolution_candidates", true);
    await queryRunner.dropTable("extraction_events", true);
    await queryRunner.dropTable("document_chunks", true);
    await queryRunner.dropTable("source_documents", true);
  }
}
