# Knowledge Graph Engineering Notes

## CRE Graph Priorities

1. Model relationships, not just entities.
2. Track time on relationships and obligations.
3. Separate extracted facts from verified facts.
4. Preserve provenance for every high-impact answer.
5. Use graph traversal for impact analysis.

## Example Queries

- Which tenants are affected by an amendment to CAM obligations?
- Which spaces are occupied by tenants with leases expiring in the next 180 days?
- Which permits relate to spaces with active construction obligations?
- Which legal obligations are active today for a given tenant?
- Which entities are likely duplicates across lease, finance, and operations systems?

## Interview Signal

This demo should communicate that healthcare/FHIR-style entity modeling transfers well to CRE:

- FHIR resources are typed entities.
- References are graph relationships.
- Provenance and history map to trust and temporal modeling.
- Care workflows map to CRE operational workflows.

