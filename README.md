# CRE Knowledge Graph AI

A portfolio demo for a commercial real estate knowledge graph and AI reasoning layer.

The project models how fragmented CRE records, including leases, spaces, tenants, amendments, permits, and obligations, can become a trusted context graph for portfolio reasoning.

## What This Demonstrates

- CRE ontology design for assets, buildings, spaces, tenants, leases, amendments, permits, and obligations
- Temporal relationships, such as occupancy and legal duties that are active only during specific periods
- Entity resolution for messy tenant and property names
- Version-aware trust management through source metadata and confidence scores
- Lease extraction schema for AI-assisted document parsing
- A GraphRAG-ready shape for combining document evidence with graph traversal
- Dockerized local execution with Postgres and Neo4j
- TypeORM entities and versioned migrations instead of inline SQL
- API routes for health checks, graph impact analysis, and graph-augmented RAG
- Lease administration workflow API that combines abstraction, critical dates, citations, graph impacts, and recommended actions
- CRUD APIs for source documents and chunks
- Connector seams for RESO/IDX MLS feeds, PDF parsing, and Google Maps geocoding
- Financial dashboard with KPI, line chart, and bar chart visualizations
- Deterministic GraphRAG evals for citation relevance, graph grounding, and database-backed answer mode
- Provider-neutral embedding adapter with deterministic local mode and optional managed HTTP provider
- AWS deployment blueprint for a containerized production path

## Tech Stack

- Next.js
- React
- TypeScript
- Postgres
- Neo4j
- TypeORM
- Vitest
- Docker Compose

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Run the Full Local AI Stack

This starts the app, Postgres, and Neo4j.

```bash
cp .env.example .env
docker compose up -d postgres neo4j
npm run db:seed
npm run dev
```

Or run everything in containers. The Compose stack includes a one-shot `seed` service, so the app waits until Postgres and Neo4j are migrated and seeded.

```bash
docker compose up --build
```

To run the full acceptance check against live local databases:

```bash
npm run stack:verify
```

This command starts Postgres and Neo4j, runs TypeORM migrations, seeds both stores, runs Next.js on `http://localhost:3100`, then asserts that `/api/health`, `/api/rag`, `/api/graph/impact`, and the document CRUD APIs use the live database stack.

To verify the actual app container path with Docker Compose:

```bash
npm run compose:verify
```

This command builds and starts the Compose `app` service, one-shot `seed` service, Postgres, and Neo4j under isolated host ports, then checks database health, live GraphRAG evals, and the lease administration workflow through the containerized app.

Useful local endpoints:

```bash
curl http://localhost:3000/api/health

curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{"question":"What CAM obligation changed for Northstar?"}'

curl "http://localhost:3000/api/graph/impact?tenant=Northstar%20Logistics"

curl -X POST http://localhost:3000/api/workflows/lease-administration \
  -H "Content-Type: application/json" \
  -d '{"question":"What lease administration work is needed for Northstar?"}'

curl http://localhost:3000/api/financial/dashboard

curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"id":"lease-upload-1","title":"Lease Upload","sourceType":"manual_upload","chunks":[{"id":"lease-upload-1-chunk-0","content":"Lease text here","entityRefs":["tenant-northstar"]}]}'

curl -X POST http://localhost:3000/api/ingest/mls \
  -H "Content-Type: application/json" \
  -d '{"city":"Buffalo","state":"NY","limit":10}'

curl -X POST http://localhost:3000/api/ingest/pdf \
  -F "file=@./sample-lease.pdf"
```

Neo4j browser is available at `http://localhost:7474`.

Credentials:

- User: `neo4j`
- Password: `landmark-demo-password`

## Test

```bash
npm test
npm run ai:evaluate
```

`npm run ai:evaluate` runs deterministic GraphRAG quality checks over the local corpus. `npm run stack:verify` runs the same eval cases against the live HTTP API after standing up Postgres and Neo4j.

## CI

GitHub Actions runs typecheck, tests, audit, production build, Docker Compose config validation, Terraform validation, and a live Docker-stack job that executes `npm run stack:verify`. The live-stack job stands up Postgres and Neo4j, runs migrations/seeds, exercises RAG, graph traversal, and full document CRUD, then tears the environment down.

## External Data Sources

The repository includes typed adapters and ingestion routes for:

- RESO Web API / IDX-style MLS feeds: `lib/connectors/mls/reso-web-api-client.ts`
- Google Maps geocoding: `lib/connectors/maps/google-maps-client.ts`
- PDF parsing: `lib/connectors/documents/pdf-parser.ts`

Configure these environment variables when using the external ingestion routes:

```bash
RESO_WEB_API_BASE_URL=...
RESO_WEB_API_ACCESS_TOKEN=...
GOOGLE_MAPS_API_KEY=...
```

Embedding provider configuration:

```bash
EMBEDDING_PROVIDER=deterministic
# or
EMBEDDING_PROVIDER=http
EMBEDDING_API_URL=https://your-embedding-service.example/v1/embeddings
EMBEDDING_API_KEY=...
EMBEDDING_MODEL=managed-embedding-model
EMBEDDING_RESPONSE_PATH=data.0.embedding
```

The local demo defaults to deterministic embeddings so Docker and CI run without external credentials. Database ingestion and database-backed RAG use the async provider boundary, so production can point both chunk creation and query retrieval at the same managed embedding service.

## Project Structure

```text
app/                         Next.js UI
lib/graph/                   CRE graph types and sample data
lib/extraction/              Lease extraction schema
lib/entity-resolution/       Entity matching helpers
lib/db/                      Postgres and Neo4j clients
lib/rag/                     Embeddings, retrieval, and answer synthesis
lib/connectors/              RESO/IDX, PDF, and Google Maps adapters
lib/documents/               TypeORM document repository and schemas
lib/ingestion/               Source ingestion orchestration
lib/temporal/                Temporal relationship helpers
lib/trust/                   Source and confidence helpers
lib/db/migrations/           TypeORM database migrations
scripts/                     Database seed scripts
infra/aws/                   AWS deployment blueprint
docs/architecture/           System design notes
docs/memory/                 Decision log
docs/skills/                 Knowledge graph skill notes
tests/                       Focused domain tests
```

## Demo Narrative

The app starts with an industrial property context graph and financial command center. The sample graph connects a portfolio asset to a building, floor, space, tenant, lease, amendment, permit, and legal obligation. The dashboard tracks rent, NOI, occupancy, expense mix, lease rollover risk, and CAM exposure. The local stack stores document chunks and embeddings in Postgres, stores graph facts in Neo4j, and answers questions by combining embedding retrieval with graph traversal. The lease administration workflow composes the same evidence into an abstract, critical dates, graph impacts, citations, and recommended operating actions.

## AWS Direction

See `infra/aws/README.md` for a deployable target architecture using:

- ECS Fargate behind an Application Load Balancer for the Next.js container
- Terraform-managed RDS PostgreSQL for documents, extraction events, and embeddings
- Neo4j Aura, Neo4j on ECS/EC2, or Amazon Neptune with a repository adapter
- Secrets Manager for database credentials
- CloudWatch logs, health checks, and a one-shot ECS migration/seed task definition

Operational scripts:

```bash
npm run aws:image:push
npm run aws:seed
npm run aws:verify
```
