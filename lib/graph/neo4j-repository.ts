import type { Driver } from "neo4j-driver";
import { graphHealthCypher, tenantImpactCypher } from "./cypher";

export type GraphImpactFact = {
  tenant: string;
  space: string;
  lease: string;
  amendment: string | null;
  obligation: string | null;
  permit: string | null;
};

export type GraphHealth = {
  nodes: number;
  relationships: number;
};

export async function getTenantImpact(driver: Driver, tenantName: string): Promise<GraphImpactFact[]> {
  const session = driver.session();

  try {
    const result = await session.run(tenantImpactCypher, { tenantName });

    return result.records.map((record) => ({
      tenant: record.get("tenant"),
      space: record.get("space"),
      lease: record.get("lease"),
      amendment: record.get("amendment"),
      obligation: record.get("obligation"),
      permit: record.get("permit")
    }));
  } finally {
    await session.close();
  }
}

export async function getGraphHealth(driver: Driver): Promise<GraphHealth> {
  const session = driver.session();

  try {
    const result = await session.run(graphHealthCypher);
    const record = result.records[0];

    return {
      nodes: record.get("nodes").toNumber(),
      relationships: record.get("relationships").toNumber()
    };
  } finally {
    await session.close();
  }
}

