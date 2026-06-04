export type EntityResolutionCandidate = {
  sourceName: string;
  candidateName: string;
  sharedAddress?: boolean;
  sharedTaxId?: boolean;
  sharedLeaseId?: boolean;
};

export type EntityResolutionScore = {
  score: number;
  signals: string[];
  decision: "match" | "review" | "distinct";
};

export function scoreEntityCandidate(candidate: EntityResolutionCandidate): EntityResolutionScore {
  const sourceTokens = tokenize(candidate.sourceName);
  const candidateTokens = tokenize(candidate.candidateName);
  const nameScore = jaccard(sourceTokens, candidateTokens);

  let score = nameScore * 0.58;
  const signals = [`name similarity ${nameScore.toFixed(2)}`];

  if (candidate.sharedTaxId) {
    score += 0.28;
    signals.push("shared tax id");
  }

  if (candidate.sharedLeaseId) {
    score += 0.18;
    signals.push("shared lease id");
  }

  if (candidate.sharedAddress) {
    score += 0.12;
    signals.push("shared address");
  }

  if (candidate.sharedAddress && hasAnyOverlap(sourceTokens, candidateTokens)) {
    score = Math.max(score, 0.56);
    signals.push("shared address with name token overlap");
  }

  const boundedScore = Math.min(1, Number(score.toFixed(3)));

  return {
    score: boundedScore,
    signals,
    decision: boundedScore >= 0.82 ? "match" : boundedScore >= 0.55 ? "review" : "distinct"
  };
}

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !["llc", "inc", "ltd", "co", "company", "the"].includes(token));
}

function jaccard(left: string[], right: string[]): number {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const union = new Set([...leftSet, ...rightSet]);
  const intersection = [...leftSet].filter((token) => rightSet.has(token));

  if (union.size === 0) {
    return 0;
  }

  return intersection.length / union.size;
}

function hasAnyOverlap(left: string[], right: string[]): boolean {
  const rightSet = new Set(right);
  return left.some((token) => rightSet.has(token));
}
