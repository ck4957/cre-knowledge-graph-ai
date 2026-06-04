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

- **Container runtime:** ECS Fargate behind an Application Load Balancer
- **Container registry:** ECR
- **Relational/RAG evidence store:** RDS PostgreSQL managed by Terraform
- **Graph store:** Neo4j Aura, Neo4j self-managed on ECS/EC2, or Amazon Neptune
- **Secrets:** AWS Secrets Manager
- **Logs and metrics:** CloudWatch
- **Networking:** Private subnets for databases, public ALB/App Runner ingress for the app

## Deployment Steps

The `terraform/` folder provisions the app runtime, ALB ingress, RDS PostgreSQL, locked-down security groups, CloudWatch logs, and the Secrets Manager entry used for `DATABASE_URL`. Neo4j is intentionally an external graph endpoint so the same application can point to Neo4j Aura, a self-managed Neo4j deployment, or a future Neptune repository adapter.

1. Build and push the app image.

```bash
aws ecr create-repository --repository-name cre-knowledge-graph-ai
aws ecr get-login-password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
docker build -t cre-knowledge-graph-ai .
docker tag cre-knowledge-graph-ai:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/cre-knowledge-graph-ai:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/cre-knowledge-graph-ai:latest"
```

2. Provision graph storage.

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

3. Apply Terraform.

Terraform creates the app load balancer, ECS service, RDS PostgreSQL instance, generated database password, and `DATABASE_URL` secret. It also registers a one-shot ECS task definition that runs TypeORM migrations and seeds Postgres + Neo4j.

```bash
cd infra/aws/terraform
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var='public_subnet_ids=["subnet-public-a","subnet-public-b"]' \
  -var='app_subnet_ids=["subnet-public-a","subnet-public-b"]' \
  -var='database_subnet_ids=["subnet-private-a","subnet-private-b"]' \
  -var="vpc_id=vpc-abc" \
  -var="neo4j_password_secret_arn=arn:aws:secretsmanager:..." \
  -var="neo4j_uri=bolt://GRAPH_HOST:7687" \
  -var="neo4j_username=neo4j"
```

4. Run migrations and seed data inside ECS.

```bash
aws ecs run-task \
  --cluster "$(terraform output -raw ecs_cluster_name)" \
  --task-definition "$(terraform output -raw seed_task_family)" \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-public-a,subnet-public-b],securityGroups=[$(terraform output -raw app_security_group_id)],assignPublicIp=ENABLED}"
```

5. Verify:

```bash
curl "$(terraform output -raw app_url)/api/health"
curl -X POST "$(terraform output -raw app_url)/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"question":"What CAM obligation changed for Northstar?"}'
```

## Terraform App Scaffold

```bash
cd infra/aws/terraform
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var='public_subnet_ids=["subnet-public-a","subnet-public-b"]' \
  -var='app_subnet_ids=["subnet-public-a","subnet-public-b"]' \
  -var='database_subnet_ids=["subnet-private-a","subnet-private-b"]' \
  -var="vpc_id=vpc-abc" \
  -var="neo4j_password_secret_arn=arn:aws:secretsmanager:..." \
  -var="neo4j_uri=bolt://GRAPH_HOST:7687" \
  -var="neo4j_username=neo4j"
```

## Production Hardening Checklist

- Use Secrets Manager instead of plaintext environment variables.
- Add database migrations instead of direct init SQL.
- Replace deterministic local embeddings with a managed provider and store higher-dimensional vectors.
- Add ingestion jobs for PDF parsing, OCR, and extraction review.
- Add HTTPS listener and ACM certificate for the ALB.
- Add CloudWatch alarms for API error rates, RDS CPU/storage, and graph database availability.
- Add CI checks for `npm run typecheck`, `npm test`, `npm audit`, and `npm run build`.
