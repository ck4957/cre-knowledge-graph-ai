import type { GraphImpactFact } from "@/lib/graph/neo4j-repository";
import type { RagAnswer } from "@/lib/rag/answer";

export type GraphRagEvalCase = {
  id: string;
  question: string;
  minCitations: number;
  requiredCitationTerms: string[];
  requiredCitationEntityRefs: string[];
  requiredAnswerTerms: string[];
  requiredGraphFact?: Partial<GraphImpactFact>;
  requiredMode?: RagAnswer["mode"];
};

export type GraphRagEvalResult = {
  id: string;
  question: string;
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
};

export const graphRagEvalCases: GraphRagEvalCase[] = [
  {
    id: "cam-obligation-change",
    question: "What CAM obligation changed for Northstar?",
    minCitations: 1,
    requiredCitationTerms: ["CAM", "true-up"],
    requiredCitationEntityRefs: ["tenant-northstar", "obligation-cam"],
    requiredAnswerTerms: ["CAM", "true-up", "Space 110"],
    requiredGraphFact: {
      tenant: "Northstar Logistics",
      space: "Space 110",
      amendment: "CAM Amendment",
      obligation: "CAM true-up"
    }
  },
  {
    id: "space-permit-impact",
    question: "Which permit affects Space 110?",
    minCitations: 1,
    requiredCitationTerms: ["permit", "Space 110"],
    requiredCitationEntityRefs: ["permit-loading-dock", "space-110"],
    requiredAnswerTerms: ["Dock Permit", "Space 110"],
    requiredGraphFact: {
      tenant: "Northstar Logistics",
      space: "Space 110",
      permit: "Dock Permit"
    }
  },
  {
    id: "renewal-option",
    question: "Does Northstar have a renewal option?",
    minCitations: 1,
    requiredCitationTerms: ["five-year renewal option", "180 days"],
    requiredCitationEntityRefs: ["tenant-northstar", "lease-2024-northstar"],
    requiredAnswerTerms: ["renewal", "Northstar"],
    requiredGraphFact: {
      tenant: "Northstar Logistics",
      lease: "Lease 2024-01"
    }
  }
];

export function evaluateGraphRagAnswer(testCase: GraphRagEvalCase, answer: RagAnswer): GraphRagEvalResult {
  const citationText = answer.citations.map((citation) => `${citation.title} ${citation.content}`).join(" ");
  const citationEntityRefs = new Set(answer.citations.flatMap((citation) => citation.entityRefs));
  const checks: GraphRagEvalResult["checks"] = [
    {
      name: "mode",
      passed: !testCase.requiredMode || answer.mode === testCase.requiredMode,
      detail: testCase.requiredMode ? `expected ${testCase.requiredMode}, received ${answer.mode}` : `received ${answer.mode}`
    },
    {
      name: "minimum citations",
      passed: answer.citations.length >= testCase.minCitations,
      detail: `expected at least ${testCase.minCitations}, received ${answer.citations.length}`
    },
    {
      name: "citation terms",
      passed: containsAll(citationText, testCase.requiredCitationTerms),
      detail: `required terms: ${testCase.requiredCitationTerms.join(", ")}`
    },
    {
      name: "citation entity refs",
      passed: testCase.requiredCitationEntityRefs.every((entityRef) => citationEntityRefs.has(entityRef)),
      detail: `required refs: ${testCase.requiredCitationEntityRefs.join(", ")}`
    },
    {
      name: "answer terms",
      passed: containsAll(answer.answer, testCase.requiredAnswerTerms),
      detail: `required terms: ${testCase.requiredAnswerTerms.join(", ")}`
    }
  ];

  if (testCase.requiredGraphFact) {
    checks.push({
      name: "graph grounding",
      passed: answer.graphFacts.some((fact) => matchesGraphFact(fact, testCase.requiredGraphFact ?? {})),
      detail: `required graph fields: ${Object.entries(testCase.requiredGraphFact)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ")}`
    });
  }

  return {
    id: testCase.id,
    question: testCase.question,
    checks,
    passed: checks.every((check) => check.passed)
  };
}

export function evaluateGraphRagAnswers(
  testCases: GraphRagEvalCase[],
  answers: Map<string, RagAnswer>
): GraphRagEvalResult[] {
  return testCases.map((testCase) => {
    const answer = answers.get(testCase.id);

    if (!answer) {
      return {
        id: testCase.id,
        question: testCase.question,
        passed: false,
        checks: [{ name: "answer present", passed: false, detail: "No answer was provided for this eval case." }]
      };
    }

    return evaluateGraphRagAnswer(testCase, answer);
  });
}

function containsAll(text: string, terms: string[]): boolean {
  const normalized = text.toLowerCase();
  return terms.every((term) => normalized.includes(term.toLowerCase()));
}

function matchesGraphFact(fact: GraphImpactFact, required: Partial<GraphImpactFact>): boolean {
  return Object.entries(required).every(([key, expected]) => {
    if (!expected) {
      return true;
    }

    const actual = fact[key as keyof GraphImpactFact];
    return typeof actual === "string" && actual.toLowerCase().includes(expected.toLowerCase());
  });
}
