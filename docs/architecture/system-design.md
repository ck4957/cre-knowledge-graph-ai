# System Design

## Product Thesis

Commercial real estate teams need a system of truth that connects documents, systems, and physical reality. A knowledge graph gives the platform a durable memory of how assets, spaces, tenants, contracts, obligations, and operational events relate over time.

## Architecture

```text
Source systems
  |-- Lease PDFs
  |-- Amendments
  |-- Permits
  |-- RESO/IDX MLS feeds
  |-- Google Maps geocoding
  |-- Property management records
  |-- Financial systems
  |-- Tenant coordination notes
        |
        v
Document ingestion and extraction
        |
        v
Entity resolution and validation
        |
        v
Temporal property context graph
        |
        v
Graph retrieval and reasoning
        |
        v
Portfolio decisions, alerts, and evidence-backed answers
```

## Local Runtime

```text
Next.js app
  |-- /api/rag
  |     |-- embeds question locally
  |     |-- loads persisted document embeddings through TypeORM repositories
  |     '-- traverses Neo4j tenant impact graph
  |
  |-- /api/graph/impact
  |     '-- runs Cypher tenant-space-lease-obligation traversal
  |
  |-- /api/documents
  |     '-- full CRUD for source documents and embedded chunks
  |
  |-- /api/financial/dashboard
  |     '-- KPI, NOI, occupancy, expense, rollover, and CAM metrics
  |
  |-- /api/ingest/mls and /api/ingest/pdf
  |     '-- external source ingestion into the document repository
  |
  '-- /api/health
        |-- checks Postgres seeded chunk count
        '-- checks Neo4j graph counts

Postgres + TypeORM
  |-- source_documents
  |-- document_chunks
  |-- extraction_events
  '-- entity_resolution_candidates

Neo4j
  |-- Asset, Building, Floor, Space
  |-- Tenant, Lease, Amendment
  '-- Permit, Obligation
```

## Core Graph Concepts

- `Asset`: A portfolio-level property or industrial campus.
- `Building`: A physical structure inside an asset.
- `Floor`: A level within a building.
- `Space`: A rentable or operational unit.
- `Tenant`: A legal or operating entity occupying space.
- `Lease`: A contract governing occupancy and economics.
- `Amendment`: A versioned change to a lease.
- `Permit`: A government or operational approval tied to a property.
- `Obligation`: A legal, operational, or financial duty.
- `Document`: Evidence from which facts were extracted.

## Trust Model

Every extracted fact should carry:

- Source document or source system
- Extraction method
- Confidence score
- Reviewer state
- Version timestamp
- Validity period when applicable

## Retrieval Strategy

The demo is shaped for hybrid retrieval:

- Vector retrieval finds semantically relevant document excerpts.
- Graph traversal expands through related tenants, spaces, leases, and obligations.
- The answer layer cites both graph facts and source evidence.
- GraphRAG evals assert citation relevance, entity references, answer terms, graph facts, and database-backed mode for critical portfolio questions.

The current local implementation uses deterministic embeddings so the system runs without an external AI API key. A production implementation can replace `lib/rag/embedding.ts` with OpenAI, Bedrock, or another embedding provider without changing the database or graph repository boundaries.

## Deployment Strategy

- Local: Docker Compose runs the app, Postgres, and Neo4j.
- AWS app tier: ECS Fargate runs the Docker image behind an Application Load Balancer.
- AWS relational tier: Terraform provisions RDS PostgreSQL, a generated database password, and the `DATABASE_URL` secret for documents, embeddings, extraction events, and entity resolution candidates.
- AWS graph tier: Neo4j Aura, Neo4j on ECS/EC2, or Amazon Neptune with an adapter for openCypher queries.
- Operations: ECS includes a one-shot seed task definition for TypeORM migrations plus Postgres and Neo4j seed data, with Secrets Manager, CloudWatch logs, health endpoints, and IaC-managed environment variables.
