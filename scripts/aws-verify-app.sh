#!/usr/bin/env bash
set -euo pipefail

TERRAFORM_DIR="${TERRAFORM_DIR:-infra/aws/terraform}"
APP_URL="${APP_URL:-}"

if [ -z "${APP_URL}" ]; then
  APP_URL="$(terraform -chdir="${TERRAFORM_DIR}" output -raw app_url 2>/dev/null || true)"
fi

if [ -z "${APP_URL}" ]; then
  echo "APP_URL is required, or Terraform output app_url must be available." >&2
  exit 1
fi

APP_URL="${APP_URL%/}"

echo "Verifying deployed health endpoint at ${APP_URL}..."
HEALTH_JSON="$(curl -fsS "${APP_URL}/api/health")"
node -e '
const payload = JSON.parse(process.argv[1]);
if (!payload.postgres?.ok || payload.postgres.chunks < 1) {
  throw new Error(`Postgres health failed: ${JSON.stringify(payload.postgres)}`);
}
if (!payload.neo4j?.ok || payload.neo4j.nodes < 1 || payload.neo4j.relationships < 1) {
  throw new Error(`Graph health failed: ${JSON.stringify(payload.neo4j)}`);
}
' "${HEALTH_JSON}"

echo "Verifying deployed GraphRAG endpoint..."
npm run ai:evaluate:http -- "${APP_URL}"

echo "Verifying deployed lease administration workflow..."
WORKFLOW_JSON="$(curl -fsS -X POST "${APP_URL}/api/workflows/lease-administration" \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What lease administration work is needed for Northstar?\"}")"
node -e '
const payload = JSON.parse(process.argv[1]);
const workflow = payload.workflow;
if (workflow?.mode !== "database") {
  throw new Error(`Expected database workflow mode, received ${workflow?.mode}: ${payload.warning ?? ""}`);
}
if (!workflow.citations?.length || !workflow.impacts?.length) {
  throw new Error(`Expected citations and graph impacts: ${JSON.stringify(workflow)}`);
}
if (!workflow.criticalDates?.some((date) => date.label === "Renewal notice deadline")) {
  throw new Error(`Expected renewal critical date: ${JSON.stringify(workflow.criticalDates)}`);
}
' "${WORKFLOW_JSON}"

echo "AWS app verified: health, GraphRAG, and lease workflow are live."
