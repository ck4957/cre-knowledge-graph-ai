# System Design

## Product Thesis

Commercial real estate teams need a system of truth that connects documents, systems, and physical reality. A knowledge graph gives the platform a durable memory of how assets, spaces, tenants, contracts, obligations, and operational events relate over time.

## Architecture

```text
Source systems
  |-- Lease PDFs
  |-- Amendments
  |-- Permits
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

