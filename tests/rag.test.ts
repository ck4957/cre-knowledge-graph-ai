import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGraphAugmentedAnswer } from "@/lib/rag/answer";
import { createEmbeddingProvider, embedText, embedTextAsync, vectorLiteral } from "@/lib/rag/embedding";
import { rankChunks, retrieveFromLocalCorpus } from "@/lib/rag/retriever";

describe("local RAG retrieval", () => {
  it("retrieves CAM amendment evidence for obligation questions", () => {
    const chunks = retrieveFromLocalCorpus("What CAM obligation changed for Northstar?", 2);

    expect(chunks[0].content.toLowerCase()).toContain("cam");
    expect(chunks[0].entityRefs).toContain("tenant-northstar");
  });

  it("builds graph-augmented answers with citations", () => {
    const citations = retrieveFromLocalCorpus("Which permit affects Space 110?", 1);
    const answer = buildGraphAugmentedAnswer("Which permit affects Space 110?", citations, [], "in-memory");

    expect(answer.answer).toContain(citations[0].title);
    expect(answer.mode).toBe("in-memory");
  });
});

describe("embedding utilities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("produces stable vector literals for diagnostics", () => {
    const literal = vectorLiteral(embedText("lease tenant space obligation"));

    expect(literal).toMatch(/^\[[\d.,-]+\]$/);
    expect(literal.split(",")).toHaveLength(8);
  });

  it("uses the deterministic async provider by default", async () => {
    await expect(embedTextAsync("lease tenant space obligation")).resolves.toEqual(embedText("lease tenant space obligation"));
  });

  it("supports HTTP embedding providers with nested response paths", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            embedding: [3, 4]
          }
        ]
      })
    } as Response);
    const provider = createEmbeddingProvider({
      provider: "http",
      apiUrl: "https://embeddings.example.test",
      apiKey: "test-key",
      model: "managed-embedding-model",
      responsePath: "data.0.embedding"
    });

    await expect(provider.embed("CAM obligation")).resolves.toEqual([0.6, 0.8]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://embeddings.example.test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
        body: JSON.stringify({ input: "CAM obligation", model: "managed-embedding-model" })
      })
    );
  });
});

describe("rankChunks", () => {
  it("ranks persisted chunk embeddings without database-specific SQL", () => {
    const query = embedText("CAM obligation");
    const ranked = rankChunks(
      [
        {
          id: "a",
          documentId: "doc-a",
          title: "Assignment",
          content: "Assignment rights",
          entityRefs: [],
          embedding: embedText("assignment sublease consent")
        },
        {
          id: "b",
          documentId: "doc-b",
          title: "CAM",
          content: "CAM true-up obligation",
          entityRefs: ["obligation-cam"],
          embedding: embedText("CAM true-up obligation")
        }
      ],
      query,
      1
    );

    expect(ranked[0].id).toBe("b");
  });
});
