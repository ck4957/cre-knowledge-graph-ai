import neo4j from "neo4j-driver";
import { graphEdges, graphNodes } from "../lib/graph/sample-data";

const uri = process.env.NEO4J_URI ?? "bolt://localhost:7687";
const username = process.env.NEO4J_USERNAME ?? "neo4j";
const password = process.env.NEO4J_PASSWORD ?? "landmark-demo-password";

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const nodeLabels = new Set(graphNodes.map((node) => node.type));
const relationshipTypes = new Set(graphEdges.map((edge) => edge.type));

function assertKnownLabel(label: string): string {
  if (!nodeLabels.has(label as never)) {
    throw new Error(`Unexpected node label: ${label}`);
  }

  return label;
}

function assertKnownRelationship(type: string): string {
  if (!relationshipTypes.has(type as never)) {
    throw new Error(`Unexpected relationship type: ${type}`);
  }

  return type;
}

async function main() {
  const session = driver.session();

  try {
    await session.run("MATCH (n) DETACH DELETE n");

    for (const node of graphNodes) {
      const label = assertKnownLabel(node.type);
      await session.run(
        `
        MERGE (n:${label} {id: $id})
        SET n.name = $label, n += $properties
        `,
        {
          id: node.id,
          label: node.label,
          properties: node.properties
        }
      );
    }

    for (const edge of graphEdges) {
      const relationshipType = assertKnownRelationship(edge.type);
      await session.run(
        `
        MATCH (source {id: $source})
        MATCH (target {id: $target})
        MERGE (source)-[r:${relationshipType} {id: $id}]->(target)
        SET r.label = $label,
            r.validFrom = $validFrom,
            r.validTo = $validTo,
            r.confidence = $confidence,
            r.sourceSystem = $sourceSystem,
            r.evidence = $evidence
        `,
        {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          validFrom: edge.validFrom ?? null,
          validTo: edge.validTo ?? null,
          confidence: edge.confidence,
          sourceSystem: edge.sourceSystem,
          evidence: edge.evidence
        }
      );
    }

    console.log("Seeded Neo4j CRE property context graph.");
  } finally {
    await session.close();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await driver.close();
  });

