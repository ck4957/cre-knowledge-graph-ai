#!/usr/bin/env bash
set -euo pipefail

TERRAFORM_DIR="${TERRAFORM_DIR:-infra/aws/terraform}"
AWS_REGION="${AWS_REGION:-$(aws configure get region 2>/dev/null || true)}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
ECR_REPOSITORY_URL="${ECR_REPOSITORY_URL:-}"

if [ -z "${AWS_REGION}" ]; then
  echo "AWS_REGION is required, or configure a default AWS CLI region." >&2
  exit 1
fi

if [ -z "${ECR_REPOSITORY_URL}" ]; then
  ECR_REPOSITORY_URL="$(terraform -chdir="${TERRAFORM_DIR}" output -raw ecr_repository_url 2>/dev/null || true)"
fi

if [ -z "${ECR_REPOSITORY_URL}" ]; then
  cat >&2 <<'EOF'
ECR_REPOSITORY_URL is required.

Set it explicitly or run Terraform far enough to create the ECR repository, then retry:
  terraform -chdir=infra/aws/terraform init
  terraform -chdir=infra/aws/terraform apply
EOF
  exit 1
fi

REGISTRY="${ECR_REPOSITORY_URL%%/*}"

echo "Logging in to ECR registry ${REGISTRY}..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"

echo "Building app image ${ECR_REPOSITORY_URL}:${IMAGE_TAG}..."
docker build --target runner \
  -t "${ECR_REPOSITORY_URL}:${IMAGE_TAG}" \
  -t "${ECR_REPOSITORY_URL}:latest" \
  .

echo "Pushing ${ECR_REPOSITORY_URL}:${IMAGE_TAG} and latest..."
docker push "${ECR_REPOSITORY_URL}:${IMAGE_TAG}"
docker push "${ECR_REPOSITORY_URL}:latest"

cat <<EOF
Image pushed:
  ${ECR_REPOSITORY_URL}:${IMAGE_TAG}

Use this Terraform variable for immutable deployments:
  -var="container_image=${ECR_REPOSITORY_URL}:${IMAGE_TAG}"
EOF
