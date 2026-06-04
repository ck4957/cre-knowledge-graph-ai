export const tenantImpactCypher = `
MATCH (tenant:Tenant)-[:LEASES]->(space:Space)
MATCH (lease:Lease)-[:SUPPORTED_BY]->(tenant)
OPTIONAL MATCH (lease)-[:HAS_AMENDMENT]->(amendment:Amendment)-[:CREATES_OBLIGATION]->(obligation:Obligation)
OPTIONAL MATCH (permit:Permit)-[:RELATES_TO]->(space)
WHERE toLower(tenant.name) CONTAINS toLower($tenantName)
RETURN
  tenant.name AS tenant,
  space.name AS space,
  lease.name AS lease,
  amendment.name AS amendment,
  obligation.name AS obligation,
  permit.name AS permit
LIMIT 10
`;

export const graphHealthCypher = `
MATCH (n)
OPTIONAL MATCH ()-[r]->()
RETURN count(DISTINCT n) AS nodes, count(DISTINCT r) AS relationships
`;

