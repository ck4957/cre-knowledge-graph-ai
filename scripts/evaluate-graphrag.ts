import type { GraphImpactFact } from "@/lib/graph/neo4j-repository";
import { buildGraphAugmentedAnswer, type RagAnswer } from "@/lib/rag/answer";
import { retrieveFromLocalCorpus } from "@/lib/rag/retriever";
import { evaluateGraphRagAnswers, graphRagEvalCases } from "@/lib/evals/graphrag-evaluator";

const localGraphFacts: GraphImpactFact[] = [
  {
    tenant: "Northstar Logistics",
    space: "Space 110",
    lease: "Lease 2024-01",
    amendment: "CAM Amendment",
    obligation: "CAM true-up",
    permit: "Dock Permit"
  }
];

async function main() {
  const mode = process.argv[2] ?? "local";
  const answers = mode === "http" ? await evaluateHttpEndpoint() : evaluateLocalRag();
  const results = evaluateGraphRagAnswers(
    graphRagEvalCases.map((testCase) => ({
      ...testCase,
      requiredMode: mode === "http" ? "database" : "in-memory"
    })),
    answers
  );
  const failed = results.filter((result) => !result.passed);

  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"} ${result.id}: ${result.question}`);
    for (const check of result.checks) {
      console.log(`  ${check.passed ? "ok" : "not ok"} - ${check.name}: ${check.detail}`);
    }
  }

  if (failed.length > 0) {
    throw new Error(`${failed.length} GraphRAG eval case(s) failed.`);
  }

  console.log(`GraphRAG evals passed: ${results.length}/${results.length}.`);
}

function evaluateLocalRag(): Map<string, RagAnswer> {
  return new Map(
    graphRagEvalCases.map((testCase) => [
      testCase.id,
      buildGraphAugmentedAnswer(testCase.question, retrieveFromLocalCorpus(testCase.question, 4), localGraphFacts, "in-memory")
    ])
  );
}

async function evaluateHttpEndpoint(): Promise<Map<string, RagAnswer>> {
  const baseUrl = (process.argv[3] ?? process.env.BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
  const answers = new Map<string, RagAnswer>();

  for (const testCase of graphRagEvalCases) {
    const response = await fetch(`${baseUrl}/api/rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: testCase.question })
    });

    if (!response.ok) {
      throw new Error(`GraphRAG endpoint returned ${response.status} for ${testCase.id}.`);
    }

    answers.set(testCase.id, (await response.json()) as RagAnswer);
  }

  return answers;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
