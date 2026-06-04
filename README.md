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

## Tech Stack

- Next.js
- React
- TypeScript
- Vitest

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm test
```

## Project Structure

```text
app/                         Next.js UI
lib/graph/                   CRE graph types and sample data
lib/extraction/              Lease extraction schema
lib/entity-resolution/       Entity matching helpers
lib/temporal/                Temporal relationship helpers
lib/trust/                   Source and confidence helpers
docs/architecture/           System design notes
docs/memory/                 Decision log
docs/skills/                 Knowledge graph skill notes
tests/                       Focused domain tests
```

## Demo Narrative

The app starts with an industrial property context graph. The sample graph connects a portfolio asset to a building, floor, space, tenant, lease, amendment, permit, and legal obligation. The UI surfaces active leases, upcoming critical dates, obligation exposure, and extraction confidence so reviewers can see both the answer and the evidence trail.

