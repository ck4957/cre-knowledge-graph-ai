import { describe, expect, it } from "vitest";
import { buildGraphAugmentedAnswer } from "@/lib/rag/answer";
import { embedText, vectorLiteral } from "@/lib/rag/embedding";
import { retrieveFromLocalCorpus } from "@/lib/rag/retriever";

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
  it("produces pgvector-compatible literals", () => {
    const literal = vectorLiteral(embedText("lease tenant space obligation"));

    expect(literal).toMatch(/^\[[\d.,-]+\]$/);
    expect(literal.split(",")).toHaveLength(8);
  });
});

