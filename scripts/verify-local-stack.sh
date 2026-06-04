#!/usr/bin/env bash
set -euo pipefail

APP_PORT="${APP_PORT:-3100}"
BASE_URL="http://localhost:${APP_PORT}"

export DATABASE_URL="${DATABASE_URL:-postgres://cre:cre@localhost:5432/cre_kg}"
export NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
export NEO4J_USERNAME="${NEO4J_USERNAME:-neo4j}"
export NEO4J_PASSWORD="${NEO4J_PASSWORD:-landmark-demo-password}"
export RAG_TOP_K="${RAG_TOP_K:-4}"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not reachable. Start Docker Desktop, then rerun: npm run stack:verify" >&2
  exit 1
fi

echo "Starting Postgres/pgvector and Neo4j..."
docker compose up -d postgres neo4j

echo "Waiting for Postgres..."
for _ in {1..60}; do
  if docker compose exec -T postgres pg_isready -U cre -d cre_kg >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
docker compose exec -T postgres pg_isready -U cre -d cre_kg >/dev/null

echo "Waiting for Neo4j..."
for _ in {1..90}; do
  if docker compose exec -T neo4j cypher-shell -u neo4j -p landmark-demo-password "RETURN 1" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
docker compose exec -T neo4j cypher-shell -u neo4j -p landmark-demo-password "RETURN 1" >/dev/null

echo "Seeding databases..."
npm run db:seed

echo "Starting Next.js on ${BASE_URL}..."
npx next dev -p "${APP_PORT}" >/tmp/cre-kg-next-verify.log 2>&1 &
APP_PID="$!"
cleanup() {
  kill "${APP_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..60}; do
  if curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
curl -fsS "${BASE_URL}" >/dev/null

echo "Verifying database health endpoint..."
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

echo "Verifying graph-augmented RAG endpoint..."
RAG_JSON="$(curl -fsS -X POST "${BASE_URL}/api/rag" \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What CAM obligation changed for Northstar?\"}")"
node -e '
const payload = JSON.parse(process.argv[1]);
if (payload.mode !== "database") {
  throw new Error(`Expected database mode, received ${payload.mode}: ${payload.warning ?? ""}`);
}
if (!payload.citations?.length) {
  throw new Error("Expected at least one RAG citation.");
}
if (!payload.graphFacts?.length) {
  throw new Error("Expected at least one Neo4j graph fact.");
}
' "${RAG_JSON}"

echo "Verifying graph impact endpoint..."
GRAPH_JSON="$(curl -fsS "${BASE_URL}/api/graph/impact?tenant=Northstar%20Logistics")"
node -e '
const payload = JSON.parse(process.argv[1]);
if (!payload.facts?.length) {
  throw new Error("Expected graph impact facts.");
}
if (!payload.facts[0].obligation) {
  throw new Error(`Expected an obligation in graph path: ${JSON.stringify(payload.facts[0])}`);
}
' "${GRAPH_JSON}"

echo "Local AI stack verified: Postgres/pgvector + Neo4j + GraphRAG APIs are live."

