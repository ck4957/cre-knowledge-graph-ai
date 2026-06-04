import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "document_chunks" })
export class DocumentChunkEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "document_id", type: "text" })
  documentId!: string;

  @Column({ name: "chunk_index", type: "integer" })
  chunkIndex!: number;

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "entity_refs", type: "text", array: true, default: () => "'{}'" })
  entityRefs!: string[];

  @Column({ type: "real", array: true })
  embedding!: number[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
