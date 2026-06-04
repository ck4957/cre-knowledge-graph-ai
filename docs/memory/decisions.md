# Decision Log

## 2026-06-03: Scaffold local portfolio demo

Created a Next.js and TypeScript app at the repository root because the local workspace was an empty Git repository and the referenced GitHub repo appeared to be empty.

## 2026-06-03: Model temporal truth explicitly

Relationships include `validFrom` and `validTo` fields so the demo can distinguish historical, active, and future occupancy or obligation facts.

## 2026-06-03: Keep extraction schema provider-neutral

The first lease extraction schema is a TypeScript object instead of a provider-specific SDK schema. This keeps it reusable for OpenAI structured outputs, validation libraries, or custom ingestion services.

## 2026-06-03: Start with local sample data

The first implementation uses typed sample graph data rather than a database. This keeps the portfolio demo easy to run while preserving a clean path to Neo4j, Neptune, RDF, or another graph backend.

## 2026-06-04: Upgrade from concept demo to deployable AI stack

Added Docker Compose with Postgres and Neo4j so the project demonstrates a real local RAG and graph database workflow instead of only static sample data.

## 2026-06-04: Move schema ownership to TypeORM migrations

Replaced direct init SQL and application SQL calls with TypeORM entities, migrations, repositories, and seed services. This makes database deployment versioned, readable, and testable.

## 2026-06-04: Add connector boundaries for real data ingestion

Added RESO/IDX, Google Maps, and PDF parser adapters plus ingestion API routes. These keep external data source details isolated from document persistence and RAG retrieval.

## 2026-06-04: Use deterministic local embeddings for offline demo

The RAG implementation uses a small deterministic embedding function so the demo can run without external API keys. The embedding module is isolated so it can be swapped for OpenAI, Bedrock, or another provider later.

## 2026-06-04: Keep graph traversal in repository layer

Neo4j Cypher queries live under `lib/graph/` and API routes call repository functions. This keeps room for an AWS Neptune adapter without rewriting UI or RAG orchestration.
