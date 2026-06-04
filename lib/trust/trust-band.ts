export type TrustBand = "low" | "medium" | "high";

export function trustBand(confidence: number): TrustBand {
  if (confidence >= 0.9) {
    return "high";
  }

  if (confidence >= 0.7) {
    return "medium";
  }

  return "low";
}

