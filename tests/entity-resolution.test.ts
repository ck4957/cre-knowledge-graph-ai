import { describe, expect, it } from "vitest";
import { scoreEntityCandidate, tokenize } from "@/lib/entity-resolution/score";

describe("scoreEntityCandidate", () => {
  it("matches entities with name overlap and shared identifiers", () => {
    const result = scoreEntityCandidate({
      sourceName: "Northstar Logistics LLC",
      candidateName: "Northstar Logistics",
      sharedLeaseId: true,
      sharedAddress: true
    });

    expect(result.decision).toBe("match");
    expect(result.score).toBeGreaterThanOrEqual(0.82);
  });

  it("routes partial matches to reviewer workflow", () => {
    const result = scoreEntityCandidate({
      sourceName: "Amazon Fulfillment LLC",
      candidateName: "Amazon Warehouse Buffalo",
      sharedAddress: true
    });

    expect(result.decision).toBe("review");
  });
});

describe("tokenize", () => {
  it("normalizes legal suffixes", () => {
    expect(tokenize("The Northstar Logistics, LLC")).toEqual(["northstar", "logistics"]);
  });
});

