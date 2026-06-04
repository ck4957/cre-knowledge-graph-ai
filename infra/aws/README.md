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

1. Apply Terraform far enough to create the infrastructure outputs.

```bash
cd infra/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with real VPC, subnet, and graph endpoint values
terraform init
terraform apply -var-file=terraform.tfvars
```

2. Build and push the app image.

```bash
AWS_REGION=us-east-1 npm run aws:image:push
```

The script reads `ecr_repository_url` from Terraform output unless `ECR_REPOSITORY_URL` is set. It tags the image with the current git SHA and `latest`, pushes both tags, and prints the immutable `container_image` value to use for the next Terraform apply.

3. Re-apply Terraform with the immutable app image.

```bash
terraform -chdir=infra/aws/terraform apply \
  -var-file=terraform.tfvars \
  -var="container_image=$(terraform -chdir=infra/aws/terraform output -raw ecr_repository_url):$(git rev-parse --short HEAD)"
```

4. Provision graph storage.

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

5. Run migrations and seed data inside ECS.

```bash
AWS_REGION=us-east-1 \
AWS_SEED_SUBNET_IDS=subnet-public-a,subnet-public-b \
npm run aws:seed
```

6. Verify the deployed app:

```bash
npm run aws:verify
```

`npm run aws:verify` checks `/api/health`, runs the GraphRAG eval suite against the deployed `/api/rag` endpoint, and verifies the lease administration workflow runs in database mode.

## Terraform App Scaffold

```bash
cd infra/aws/terraform
terraform init
cp terraform.tfvars.example terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## Production Hardening Checklist

- Use Secrets Manager instead of plaintext environment variables.
- Add database migrations instead of direct init SQL.
- Replace deterministic local embeddings with a managed provider and store higher-dimensional vectors.
- Add ingestion jobs for PDF parsing, OCR, and extraction review.
- Add HTTPS listener and ACM certificate for the ALB.
- Add CloudWatch alarms for API error rates, RDS CPU/storage, and graph database availability.
- Add CI checks for `npm run typecheck`, `npm test`, `npm audit`, and `npm run build`.
