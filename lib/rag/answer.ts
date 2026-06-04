import type { GraphImpactFact } from "@/lib/graph/neo4j-repository";
import type { RetrievedChunk } from "./retriever";

export type RagAnswer = {
  answer: string;
  citations: RetrievedChunk[];
  graphFacts: GraphImpactFact[];
  mode: "database" | "in-memory";
};

export function buildGraphAugmentedAnswer(
  question: string,
  citations: RetrievedChunk[],
  graphFacts: GraphImpactFact[],
  mode: RagAnswer["mode"]
): RagAnswer {
  const strongestCitation = citations[0];
  const strongestGraphFact = graphFacts[0];

  const answerParts = [
    strongestCitation
      ? `The strongest document evidence is from "${strongestCitation.title}": ${strongestCitation.content}`
      : "No document evidence was retrieved.",
    strongestGraphFact
      ? `The graph traversal connects ${strongestGraphFact.tenant} to ${strongestGraphFact.space}, ${strongestGraphFact.lease}, ${strongestGraphFact.amendment}, and ${strongestGraphFact.obligation}.`
      : "No graph impact path was found for the detected tenant.",
    `Question analyzed: ${question}`
  ];

  return {
    answer: answerParts.join(" "),
    citations,
    graphFacts,
    mode
  };
}

export function detectTenantName(question: string): string {
  return question.toLowerCase().includes("northstar") ? "Northstar Logistics" : "Northstar Logistics";
}

