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
- Dockerized local execution with Postgres/pgvector and Neo4j
- API routes for health checks, graph impact analysis, and graph-augmented RAG
- AWS deployment blueprint for a containerized production path

## Tech Stack

- Next.js
- React
- TypeScript
- Postgres with pgvector
- Neo4j
- Vitest
- Docker Compose

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Run the Full Local AI Stack

This starts the app, Postgres/pgvector, and Neo4j.

```bash
cp .env.example .env
docker compose up -d postgres neo4j
npm run db:seed
npm run dev
```

Or run everything in containers. The Compose stack includes a one-shot `seed` service, so the app waits until Postgres/pgvector and Neo4j are seeded.

```bash
docker compose up --build
```

To run the full acceptance check against live local databases:

```bash
npm run stack:verify
```

This command starts Postgres/pgvector and Neo4j, seeds both stores, runs Next.js on `http://localhost:3100`, then asserts that `/api/health`, `/api/rag`, and `/api/graph/impact` use the live database stack.

Useful local endpoints:

```bash
curl http://localhost:3000/api/health

curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{"question":"What CAM obligation changed for Northstar?"}'

curl "http://localhost:3000/api/graph/impact?tenant=Northstar%20Logistics"
```

Neo4j browser is available at `http://localhost:7474`.

Credentials:

- User: `neo4j`
- Password: `landmark-demo-password`

## Test

```bash
npm test
```

## CI

GitHub Actions runs typecheck, tests, audit, production build, Docker Compose config validation, Terraform validation, and a live Docker-stack job that executes `npm run stack:verify`.

## Project Structure

```text
app/                         Next.js UI
lib/graph/                   CRE graph types and sample data
lib/extraction/              Lease extraction schema
lib/entity-resolution/       Entity matching helpers
lib/db/                      Postgres and Neo4j clients
lib/rag/                     Embeddings, retrieval, and answer synthesis
lib/temporal/                Temporal relationship helpers
lib/trust/                   Source and confidence helpers
db/init/                     Postgres schema with pgvector
scripts/                     Database seed scripts
infra/aws/                   AWS deployment blueprint
docs/architecture/           System design notes
docs/memory/                 Decision log
docs/skills/                 Knowledge graph skill notes
tests/                       Focused domain tests
```

## Demo Narrative

The app starts with an industrial property context graph. The sample graph connects a portfolio asset to a building, floor, space, tenant, lease, amendment, permit, and legal obligation. The local stack stores document chunks and embeddings in Postgres/pgvector, stores graph facts in Neo4j, and answers questions by combining vector retrieval with graph traversal.

## AWS Direction

See `infra/aws/README.md` for a deployable target architecture using:

- ECS Fargate or App Runner for the Next.js container
- RDS PostgreSQL with `pgvector`
- Neo4j Aura, Neo4j on ECS/EC2, or Amazon Neptune with a repository adapter
- Secrets Manager for database credentials
- CloudWatch logs and alarms
