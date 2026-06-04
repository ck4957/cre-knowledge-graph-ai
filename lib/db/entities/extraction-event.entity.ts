import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "extraction_events" })
export class ExtractionEventEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "document_id", type: "text" })
  documentId!: string;

  @Column({ name: "extractor_name", type: "text" })
  extractorName!: string;

  @Column({ type: "numeric", precision: 5, scale: 4 })
  confidence!: string;

  @Column({ name: "extracted_payload", type: "jsonb" })
  extractedPayload!: Record<string, unknown>;

  @Column({ type: "boolean", default: false })
  reviewed!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
