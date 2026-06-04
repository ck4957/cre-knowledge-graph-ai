#!/usr/bin/env bash
set -euo pipefail

export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-landmark-cre-compose-verify}"
export APP_HOST_PORT="${APP_HOST_PORT:-3200}"
export POSTGRES_HOST_PORT="${POSTGRES_HOST_PORT:-55432}"
export NEO4J_HTTP_HOST_PORT="${NEO4J_HTTP_HOST_PORT:-57474}"
export NEO4J_BOLT_HOST_PORT="${NEO4J_BOLT_HOST_PORT:-57687}"

BASE_URL="http://localhost:${APP_HOST_PORT}"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not reachable. Start Docker Desktop, then rerun: npm run compose:verify" >&2
  exit 1
fi

cleanup() {
  if [ "${COMPOSE_VERIFY_TEARDOWN:-1}" = "1" ]; then
    docker compose down -v
  fi
}
trap cleanup EXIT

echo "Starting full Docker Compose app stack on ${BASE_URL}..."
docker compose down -v >/dev/null 2>&1 || true
docker compose up --build -d app

echo "Waiting for app container..."
for _ in {1..90}; do
  if curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
  echo "App container did not become ready. Recent compose logs:" >&2
  docker compose logs --tail=120 >&2
  exit 1
fi

echo "Verifying containerized database health endpoint..."
HEALTH_JSON="$(curl -fsS "${BASE_URL}/api/health")"
node -e '
const payload = JSON.parse(process.argv[1]);
if (!payload.postgres?.ok || payload.postgres.chunks < 1) {
  throw new Error(`Postgres health failed: ${JSON.stringify(payload.postgres)}`);
}
if (!payload.neo4j?.ok || payload.neo4j.nodes < 1 || payload.neo4j.relationships < 1) {
  throw new Error(`Neo4j health failed: ${JSON.stringify(payload.neo4j)}`);
}
' "${HEALTH_JSON}"

echo "Running containerized GraphRAG eval suite..."
npm run ai:evaluate:http -- "${BASE_URL}"

echo "Verifying containerized lease administration workflow..."
WORKFLOW_JSON="$(curl -fsS -X POST "${BASE_URL}/api/workflows/lease-administration" \
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
if (!workflow.actions?.some((action) => action.label === "Review CAM reconciliation package")) {
  throw new Error(`Expected CAM action: ${JSON.stringify(workflow.actions)}`);
}
' "${WORKFLOW_JSON}"

echo "Full Docker Compose app verified: app container + Postgres + Neo4j + GraphRAG are live."
