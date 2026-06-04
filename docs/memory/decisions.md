# Decision Log

## 2026-06-03: Scaffold local portfolio demo

Created a Next.js and TypeScript app at the repository root because the local workspace was an empty Git repository and the referenced GitHub repo appeared to be empty.

## 2026-06-03: Model temporal truth explicitly

Relationships include `validFrom` and `validTo` fields so the demo can distinguish historical, active, and future occupancy or obligation facts.

## 2026-06-03: Keep extraction schema provider-neutral

The first lease extraction schema is a TypeScript object instead of a provider-specific SDK schema. This keeps it reusable for OpenAI structured outputs, validation libraries, or custom ingestion services.

## 2026-06-03: Start with local sample data

The first implementation uses typed sample graph data rather than a database. This keeps the portfolio demo easy to run while preserving a clean path to Neo4j, Neptune, RDF, or another graph backend.

