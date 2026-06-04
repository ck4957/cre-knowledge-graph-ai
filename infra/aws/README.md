# AWS Deployment Blueprint

This repository is designed to run locally with Docker Compose and to move to AWS without changing the application contract.

## Target Architecture

```text
Internet
  |
  v
ALB or App Runner domain
  |
  v
Next.js container
  |-- /api/rag
  |-- /api/graph/impact
  '-- /api/health
  |
  |-- RDS PostgreSQL
  '-- Graph database
        |-- Preferred fast portfolio path: Neo4j Aura or Neo4j on ECS/EC2
        '-- AWS-native path: Amazon Neptune with an openCypher repository adapter
```

## Recommended AWS Services

- **Container runtime:** ECS Fargate or App Runner
- **Container registry:** ECR
- **Relational/vector store:** RDS PostgreSQL with the `vector` extension
- **Graph store:** Neo4j Aura, Neo4j self-managed on ECS/EC2, or Amazon Neptune
- **Secrets:** AWS Secrets Manager
- **Logs and metrics:** CloudWatch
- **Networking:** Private subnets for databases, public ALB/App Runner ingress for the app

## Deployment Steps

The `terraform/` folder contains a lightweight ECS Fargate scaffold for the app container. It assumes you already have VPC subnets and a database/graph endpoint ready, which keeps the portfolio infrastructure understandable while still deployable.

1. Build and push the app image.

```bash
aws ecr create-repository --repository-name cre-knowledge-graph-ai
aws ecr get-login-password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
docker build -t cre-knowledge-graph-ai .
docker tag cre-knowledge-graph-ai:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/cre-knowledge-graph-ai:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/cre-knowledge-graph-ai:latest"
```

2. Provision RDS PostgreSQL.

Run TypeORM migrations and seed data with `DATABASE_URL` pointed at RDS:

```bash
npm run db:seed:postgres
```

3. Provision graph storage.

For fastest deployability, use Neo4j Aura or a Neo4j container and set:

```bash
NEO4J_URI=bolt://...
NEO4J_USERNAME=...
NEO4J_PASSWORD=...
```

Then run:

```bash
npm run db:seed:neo4j
```

For an AWS-native graph path, use Amazon Neptune and implement a second repository beside `lib/graph/neo4j-repository.ts` that sends the same `tenantImpactCypher` shape through Neptune openCypher.

4. Deploy the app container with these environment variables:

```bash
DATABASE_URL=postgres://...
NEO4J_URI=bolt://...
NEO4J_USERNAME=...
NEO4J_PASSWORD=...
RAG_TOP_K=4
```

5. Verify:

```bash
curl https://YOUR_DOMAIN/api/health
curl -X POST https://YOUR_DOMAIN/api/rag \
  -H "Content-Type: application/json" \
  -d '{"question":"What CAM obligation changed for Northstar?"}'
```

## Terraform App Scaffold

```bash
cd infra/aws/terraform
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var='subnet_ids=["subnet-abc","subnet-def"]' \
  -var="vpc_id=vpc-abc" \
  -var="database_url_secret_arn=arn:aws:secretsmanager:..." \
  -var="neo4j_password_secret_arn=arn:aws:secretsmanager:..." \
  -var="neo4j_uri=bolt://GRAPH_HOST:7687" \
  -var="neo4j_username=neo4j"
```

## Production Hardening Checklist

- Use Secrets Manager instead of plaintext environment variables.
- Add database migrations instead of direct init SQL.
- Replace deterministic local embeddings with a managed provider.
- Add ingestion jobs for PDF parsing, OCR, and extraction review.
- Add CloudWatch alarms for API error rates, RDS CPU/storage, and graph database availability.
- Add CI checks for `npm run typecheck`, `npm test`, `npm audit`, and `npm run build`.
