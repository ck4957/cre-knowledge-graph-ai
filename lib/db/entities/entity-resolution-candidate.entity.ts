import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "entity_resolution_candidates" })
export class EntityResolutionCandidateEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "source_name", type: "text" })
  sourceName!: string;

  @Column({ name: "candidate_name", type: "text" })
  candidateName!: string;

  @Column({ type: "numeric", precision: 5, scale: 4 })
  score!: string;

  @Column({ type: "text" })
  decision!: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  signals!: string[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}

