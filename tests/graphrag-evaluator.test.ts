import { describe, expect, it } from "vitest";
import { buildGraphAugmentedAnswer } from "@/lib/rag/answer";
import { retrieveFromLocalCorpus } from "@/lib/rag/retriever";
import { evaluateGraphRagAnswer, graphRagEvalCases } from "@/lib/evals/graphrag-evaluator";

const graphFacts = [
  {
    tenant: "Northstar Logistics",
    space: "Space 110",
    lease: "Lease 2024-01",
    amendment: "CAM Amendment",
    obligation: "CAM true-up",
    permit: "Dock Permit"
  }
];

describe("GraphRAG evaluator", () => {
  it("passes grounded answers with relevant citations and graph facts", () => {
    const testCase = graphRagEvalCases[0];
    const answer = buildGraphAugmentedAnswer(
      testCase.question,
      retrieveFromLocalCorpus(testCase.question, 4),
      graphFacts,
      "in-memory"
    );

    const result = evaluateGraphRagAnswer({ ...testCase, requiredMode: "in-memory" }, answer);

    expect(result.passed).toBe(true);
  });

  it("fails when expected graph grounding is missing", () => {
    const testCase = graphRagEvalCases[1];
    const answer = buildGraphAugmentedAnswer(
      testCase.question,
      retrieveFromLocalCorpus(testCase.question, 4),
      [],
      "in-memory"
    );

    const result = evaluateGraphRagAnswer({ ...testCase, requiredMode: "in-memory" }, answer);

    expect(result.passed).toBe(false);
    expect(result.checks.find((check) => check.name === "graph grounding")?.passed).toBe(false);
  });
});
