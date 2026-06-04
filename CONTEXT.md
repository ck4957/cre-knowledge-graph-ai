# Project Context

## Goal

Create a portfolio-quality demo showing how a CRE platform can turn fragmented leases, permits, tenant data, and operational records into a trusted property context graph.

## Target Role Signal

The demo is meant to speak to a Founding Knowledge Graph Engineer role. It should highlight:

- Knowledge graph architecture
- CRE ontology design
- Entity resolution
- Temporal modeling
- Version-aware trust management
- Lease and legal obligation extraction
- GraphRAG-style reasoning over structured and unstructured data

## Current Scope

This version is a local Next.js app with:

- A visual property context graph
- Sample CRE entities and relationships
- Lease extraction schema
- Entity resolution scoring helper
- Temporal active-state helper
- Architecture and memory docs
- Postgres/pgvector schema for documents and vector search
- Neo4j seed path for graph traversal
- API routes for health, RAG, and graph impact analysis
- Docker Compose local stack

## Future Direction

Likely next layers:

- Document ingestion pipeline
- Hybrid vector and graph retrieval
- Confidence, provenance, and reviewer workflow
- Portfolio-level impact analysis
- AWS production deployment with managed databases and observability
