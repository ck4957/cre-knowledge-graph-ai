import type { DataSource } from "typeorm";
import type { Driver } from "neo4j-driver";
import { ExtractionEventEntity } from "@/lib/db/entities/extraction-event.entity";
import type { LeaseExtraction } from "@/lib/graph/types";
import { leaseExtractionExample } from "@/lib/graph/sample-data";
import { getTenantImpact, type GraphImpactFact } from "@/lib/graph/neo4j-repository";
import { buildGraphAugmentedAnswer, detectTenantName, type RagAnswer } from "@/lib/rag/answer";
import { retrieveFromDatabase, retrieveFromLocalCorpus, type RetrievedChunk } from "@/lib/rag/retriever";

export type CriticalDate = {
  label: string;
  date: string;
  source: string;
  priority: "high" | "medium" | "low";
};

export type WorkflowAction = {
  label: string;
  owner: "asset_manager" | "lease_administrator" | "property_manager";
  reason: string;
};

export type LeaseAdministrationWorkflow = {
  mode: "database" | "in-memory";
  tenantName: string;
  question: string;
  abstract: LeaseExtraction["fields"];
  criticalDates: CriticalDate[];
  impacts: GraphImpactFact[];
  answer: RagAnswer;
  actions: WorkflowAction[];
  citations: RetrievedChunk[];
};

export async function runDatabaseLeaseAdministrationWorkflow(input: {
  dataSource: DataSource;
  graphDriver: Driver;
  question: string;
  tenantName?: string;
  topK: number;
}): Promise<LeaseAdministrationWorkflow> {
  const tenantName = input.tenantName ?? detectTenantName(input.question);
  const [citations, graphFacts, extraction] = await Promise.all([
    retrieveFromDatabase(input.dataSource, input.question, input.topK),
    getTenantImpact(input.graphDriver, tenantName),
    getLatestReviewedLeaseExtraction(input.dataSource)
  ]);

  return buildLeaseAdministrationWorkflow({
    mode: "database",
    tenantName,
    question: input.question,
    extraction,
    citations,
    graphFacts
  });
}

export function runLocalLeaseAdministrationWorkflow(input: {
  question: string;
  tenantName?: string;
  topK: number;
  graphFacts?: GraphImpactFact[];
}): LeaseAdministrationWorkflow {
  const tenantName = input.tenantName ?? detectTenantName(input.question);
  const citations = retrieveFromLocalCorpus(input.question, input.topK);

  return buildLeaseAdministrationWorkflow({
    mode: "in-memory",
    tenantName,
    question: input.question,
    extraction: leaseExtractionExample,
    citations,
    graphFacts: input.graphFacts ?? []
  });
}

export function buildLeaseAdministrationWorkflow(input: {
  mode: LeaseAdministrationWorkflow["mode"];
  tenantName: string;
  question: string;
  extraction: LeaseExtraction;
  citations: RetrievedChunk[];
  graphFacts: GraphImpactFact[];
}): LeaseAdministrationWorkflow {
  const abstract = input.extraction.fields;
  const criticalDates = buildCriticalDates(input.extraction, input.citations, input.graphFacts);
  const answer = buildGraphAugmentedAnswer(input.question, input.citations, input.graphFacts, input.mode);

  return {
    mode: input.mode,
    tenantName: input.tenantName,
    question: input.question,
    abstract,
    criticalDates,
    impacts: input.graphFacts,
    answer,
    actions: buildWorkflowActions(abstract, criticalDates, input.graphFacts),
    citations: input.citations
  };
}

async function getLatestReviewedLeaseExtraction(dataSource: DataSource): Promise<LeaseExtraction> {
  const event = await dataSource.getRepository(ExtractionEventEntity).findOne({
    where: { reviewed: true },
    order: { createdAt: "DESC" }
  });

  if (!event) {
    return leaseExtractionExample;
  }

  return {
    documentId: event.documentId,
    confidence: Number(event.confidence),
    fields: event.extractedPayload as LeaseExtraction["fields"]
  };
}

function buildCriticalDates(
  extraction: LeaseExtraction,
  citations: RetrievedChunk[],
  graphFacts: GraphImpactFact[]
): CriticalDate[] {
  const dates: CriticalDate[] = [];
  const termEnd = valueAsString(extraction.fields.termEnd);

  if (termEnd) {
    dates.push({
      label: "Lease expiration",
      date: termEnd,
      source: extraction.documentId,
      priority: "high"
    });
  }

  if (extraction.fields.renewalOption === true && termEnd) {
    dates.push({
      label: "Renewal notice deadline",
      date: subtractDays(termEnd, 180),
      source: "Lease renewal option",
      priority: "high"
    });
  }

  if (graphFacts.some((fact) => fact.amendment?.toLowerCase().includes("cam"))) {
    dates.push({
      label: "CAM amendment effective date",
      date: "2026-04-01",
      source: "CAM amendment graph path",
      priority: "medium"
    });
  }

  const permitCitation = citations.find((citation) => citation.entityRefs.includes("permit-loading-dock"));
  if (permitCitation) {
    dates.push({
      label: "Loading dock permit window ends",
      date: "2026-09-30",
      source: permitCitation.title,
      priority: "medium"
    });
  }

  return dates;
}

function buildWorkflowActions(
  abstract: LeaseExtraction["fields"],
  criticalDates: CriticalDate[],
  graphFacts: GraphImpactFact[]
): WorkflowAction[] {
  const actions: WorkflowAction[] = [];

  if (criticalDates.some((date) => date.label === "Renewal notice deadline")) {
    actions.push({
      label: "Calendar renewal notice workflow",
      owner: "lease_administrator",
      reason: "The lease abstract shows a renewal option with a notice deadline."
    });
  }

  if (valueAsString(abstract.camResponsibility) || graphFacts.some((fact) => fact.obligation?.toLowerCase().includes("cam"))) {
    actions.push({
      label: "Review CAM reconciliation package",
      owner: "asset_manager",
      reason: "Lease evidence and graph obligations indicate a tenant CAM true-up obligation."
    });
  }

  if (graphFacts.some((fact) => fact.permit)) {
    actions.push({
      label: "Coordinate permit-related tenant access",
      owner: "property_manager",
      reason: "The graph links a permit to the tenant's occupied space."
    });
  }

  return actions;
}

function subtractDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function valueAsString(value: string | boolean | null): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
