import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "source_documents" })
export class SourceDocumentEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ name: "source_type", type: "text" })
  sourceType!: string;

  @Column({ name: "source_uri", type: "text", nullable: true })
  sourceUri!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  chunks?: unknown[];
}
