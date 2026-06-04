import { describe, expect, it } from "vitest";
import { leaseExtractionExample } from "@/lib/graph/sample-data";
import { retrieveFromLocalCorpus } from "@/lib/rag/retriever";
import { buildLeaseAdministrationWorkflow } from "@/lib/workflows/lease-administration";

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

describe("lease administration workflow", () => {
  it("builds an abstract, critical dates, graph impacts, and actions", () => {
    const workflow = buildLeaseAdministrationWorkflow({
      mode: "in-memory",
      tenantName: "Northstar Logistics",
      question: "What lease administration work is needed for Northstar?",
      extraction: leaseExtractionExample,
      citations: retrieveFromLocalCorpus("Northstar renewal CAM permit Space 110", 4),
      graphFacts
    });

    expect(workflow.abstract.tenantName).toBe("Northstar Logistics LLC");
    expect(workflow.criticalDates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Lease expiration", date: "2029-12-31" }),
        expect.objectContaining({ label: "Renewal notice deadline", date: "2029-07-04" }),
        expect.objectContaining({ label: "CAM amendment effective date", date: "2026-04-01" })
      ])
    );
    expect(workflow.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Calendar renewal notice workflow", owner: "lease_administrator" }),
        expect.objectContaining({ label: "Review CAM reconciliation package", owner: "asset_manager" }),
        expect.objectContaining({ label: "Coordinate permit-related tenant access", owner: "property_manager" })
      ])
    );
    expect(workflow.answer.graphFacts).toHaveLength(1);
  });

  it("does not invent graph-dependent actions when graph facts are absent", () => {
    const workflow = buildLeaseAdministrationWorkflow({
      mode: "in-memory",
      tenantName: "Northstar Logistics",
      question: "Does Northstar have a renewal option?",
      extraction: leaseExtractionExample,
      citations: retrieveFromLocalCorpus("renewal option Northstar", 2),
      graphFacts: []
    });

    expect(workflow.actions).toEqual(
      expect.not.arrayContaining([expect.objectContaining({ label: "Coordinate permit-related tenant access" })])
    );
  });
});
