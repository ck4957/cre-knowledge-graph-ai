#!/usr/bin/env bash
set -euo pipefail

TERRAFORM_DIR="${TERRAFORM_DIR:-infra/aws/terraform}"
AWS_REGION="${AWS_REGION:-$(aws configure get region 2>/dev/null || true)}"
AWS_SEED_SUBNET_IDS="${AWS_SEED_SUBNET_IDS:-}"
AWS_ASSIGN_PUBLIC_IP="${AWS_ASSIGN_PUBLIC_IP:-ENABLED}"

if [ -z "${AWS_REGION}" ]; then
  echo "AWS_REGION is required, or configure a default AWS CLI region." >&2
  exit 1
fi

if [ -z "${AWS_SEED_SUBNET_IDS}" ]; then
  cat >&2 <<'EOF'
AWS_SEED_SUBNET_IDS is required.

Provide a comma-separated subnet list that can reach RDS and the configured graph endpoint:
  AWS_SEED_SUBNET_IDS=subnet-public-a,subnet-public-b npm run aws:seed
EOF
  exit 1
fi

CLUSTER_NAME="$(terraform -chdir="${TERRAFORM_DIR}" output -raw ecs_cluster_name)"
TASK_FAMILY="$(terraform -chdir="${TERRAFORM_DIR}" output -raw seed_task_family)"
SECURITY_GROUP_ID="$(terraform -chdir="${TERRAFORM_DIR}" output -raw app_security_group_id)"
NETWORK_CONFIGURATION="awsvpcConfiguration={subnets=[${AWS_SEED_SUBNET_IDS}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=${AWS_ASSIGN_PUBLIC_IP}}"

echo "Running seed task ${TASK_FAMILY} on cluster ${CLUSTER_NAME}..."
TASK_ARN="$(
  aws ecs run-task \
    --region "${AWS_REGION}" \
    --cluster "${CLUSTER_NAME}" \
    --task-definition "${TASK_FAMILY}" \
    --launch-type FARGATE \
    --network-configuration "${NETWORK_CONFIGURATION}" \
    --query 'tasks[0].taskArn' \
    --output text
)"

if [ -z "${TASK_ARN}" ] || [ "${TASK_ARN}" = "None" ]; then
  echo "Failed to start ECS seed task." >&2
  exit 1
fi

echo "Waiting for seed task to stop: ${TASK_ARN}"
aws ecs wait tasks-stopped --region "${AWS_REGION}" --cluster "${CLUSTER_NAME}" --tasks "${TASK_ARN}"

TASK_STATUS_JSON="$(
  aws ecs describe-tasks \
    --region "${AWS_REGION}" \
    --cluster "${CLUSTER_NAME}" \
    --tasks "${TASK_ARN}" \
    --query 'tasks[0]' \
    --output json
)"

node -e '
const task = JSON.parse(process.argv[1]);
const container = task.containers?.find((item) => item.name === "seed") ?? task.containers?.[0];
if (!container) {
  throw new Error(`No seed container found: ${JSON.stringify(task)}`);
}
if (container.exitCode !== 0) {
  throw new Error(`Seed task failed with exit code ${container.exitCode}: ${container.reason ?? task.stoppedReason ?? "unknown"}`);
}
console.log(`Seed task completed successfully: ${task.taskArn}`);
' "${TASK_STATUS_JSON}"
