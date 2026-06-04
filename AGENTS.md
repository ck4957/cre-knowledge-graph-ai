# Agent Instructions

This repository is a portfolio demo for a CRE knowledge graph and AI reasoning layer inspired by Landmark's Founding Knowledge Graph Engineer role.

## Working Principles

- Keep the demo grounded in commercial real estate workflows: leases, spaces, tenants, obligations, permits, amendments, and portfolio-level reasoning.
- Prefer explicit domain types over generic records.
- Preserve temporal context. A relationship is rarely just true; it is true during a period, according to a source, with a confidence level.
- Treat extraction output as provisional until entity resolution, validation, and trust scoring have run.
- Update `CONTEXT.md` and `docs/memory/decisions.md` when changing the architecture, ontology, or demo narrative.

## Code Style

- TypeScript first.
- Keep domain logic in `lib/` and UI composition in `app/`.
- Keep local infrastructure in `docker-compose.yml`, `db/init/`, and `scripts/`.
- Keep cloud deployment guidance in `infra/aws/`.
- Add focused tests for scoring, temporal, and graph reasoning helpers.
- Prefer provider-neutral repository interfaces when adding cloud graph/database adapters.

## Local Stack

- Postgres with pgvector stores documents, chunks, embeddings, extraction events, and entity-resolution candidates.
- Neo4j stores the property context graph and supports impact traversal.
- Seed scripts must remain idempotent.
- API routes should fall back to in-memory retrieval only when local databases are unavailable, and should report that mode.
