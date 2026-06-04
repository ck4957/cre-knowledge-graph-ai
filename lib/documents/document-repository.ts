import { DataSource } from "typeorm";
import { DocumentChunkEntity } from "@/lib/db/entities/document-chunk.entity";
import { SourceDocumentEntity } from "@/lib/db/entities/source-document.entity";
import { embedTextAsync } from "@/lib/rag/embedding";

export type CreateSourceDocumentInput = {
  id: string;
  title: string;
  sourceType: string;
  sourceUri?: string | null;
  chunks: Array<{
    id: string;
    content: string;
    entityRefs?: string[];
  }>;
};

export type UpdateSourceDocumentInput = Partial<Pick<CreateSourceDocumentInput, "title" | "sourceType" | "sourceUri">>;

export class DocumentRepository {
  constructor(private readonly dataSource: DataSource) {}

  async list(): Promise<SourceDocumentEntity[]> {
    const documents = await this.dataSource.getRepository(SourceDocumentEntity).find({
      order: { createdAt: "DESC" }
    });

    return Promise.all(documents.map((document) => this.attachChunks(document)));
  }

  async findById(id: string): Promise<SourceDocumentEntity | null> {
    const document = await this.dataSource.getRepository(SourceDocumentEntity).findOneBy({ id });
    return document ? this.attachChunks(document) : null;
  }

  async create(input: CreateSourceDocumentInput): Promise<SourceDocumentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const documentRepository = manager.getRepository(SourceDocumentEntity);
      const chunkRepository = manager.getRepository(DocumentChunkEntity);

      const document = documentRepository.create({
        id: input.id,
        title: input.title,
        sourceType: input.sourceType,
        sourceUri: input.sourceUri ?? null
      });

      await documentRepository.save(document);
      const chunkEntities = await Promise.all(
        input.chunks.map(async (chunk, index) =>
          chunkRepository.create({
            id: chunk.id,
            documentId: input.id,
            chunkIndex: index,
            content: chunk.content,
            entityRefs: chunk.entityRefs ?? [],
            embedding: await embedTextAsync(chunk.content)
          })
        )
      );
      await chunkRepository.save(chunkEntities);

      const created = await manager.getRepository(SourceDocumentEntity).findOneBy({ id: input.id });
      if (!created) {
        throw new Error(`Document ${input.id} was not persisted.`);
      }

      const chunks = await manager.getRepository(DocumentChunkEntity).find({
        where: { documentId: input.id },
        order: { chunkIndex: "ASC" }
      });

      return Object.assign(created, { chunks });
    });
  }

  async upsert(input: CreateSourceDocumentInput): Promise<SourceDocumentEntity> {
    const existing = await this.findById(input.id);

    if (!existing) {
      return this.create(input);
    }

    await this.delete(input.id);
    return this.create(input);
  }

  async update(id: string, input: UpdateSourceDocumentInput): Promise<SourceDocumentEntity | null> {
    const repository = this.dataSource.getRepository(SourceDocumentEntity);
    const existing = await repository.findOneBy({ id });

    if (!existing) {
      return null;
    }

    await repository.save({
      ...existing,
      ...input,
      sourceUri: input.sourceUri === undefined ? existing.sourceUri : input.sourceUri
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.getRepository(SourceDocumentEntity).delete({ id });
    return Boolean(result.affected);
  }

  private async attachChunks(document: SourceDocumentEntity): Promise<SourceDocumentEntity> {
    const chunks = await this.dataSource.getRepository(DocumentChunkEntity).find({
      where: { documentId: document.id },
      order: { chunkIndex: "ASC" }
    });

    return Object.assign(document, { chunks });
  }
}
