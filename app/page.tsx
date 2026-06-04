import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  Cloud,
  Database,
  FileText,
  GitBranch,
  Layers3,
  Network,
  Scale,
  Search,
  Server,
  ShieldCheck
} from "lucide-react";
import { activeRelationships, graphEdges, graphNodes, leaseExtractionExample } from "@/lib/graph/sample-data";
import { isActive } from "@/lib/temporal/is-active";
import { trustBand } from "@/lib/trust/trust-band";

const nodePositions: Record<string, { x: number; y: number }> = {
  "asset-buffalo-industrial": { x: 60, y: 60 },
  "building-a": { x: 310, y: 72 },
  "floor-1": { x: 560, y: 76 },
  "space-110": { x: 540, y: 218 },
  "tenant-northstar": { x: 300, y: 252 },
  "lease-2024-northstar": { x: 70, y: 260 },
  "amendment-cam-2026": { x: 92, y: 410 },
  "obligation-cam": { x: 336, y: 430 },
  "permit-loading-dock": { x: 568, y: 404 }
};

const relationshipHighlights = activeRelationships(new Date("2026-06-03"));

const systemLayers = [
  {
    icon: <Database size={19} />,
    title: "Postgres + pgvector",
    text: "Stores source documents, extraction events, entity-resolution candidates, and vector embeddings for retrieval."
  },
  {
    icon: <GitBranch size={19} />,
    title: "Neo4j graph database",
    text: "Models tenants, spaces, leases, amendments, permits, and obligations as traversable graph facts."
  },
  {
    icon: <Brain size={19} />,
    title: "Graph-augmented RAG",
    text: "Retrieves lease evidence with vector search, then expands through graph impact paths before forming an answer."
  },
  {
    icon: <Cloud size={19} />,
    title: "AWS-ready topology",
    text: "Containerized app can deploy to ECS/App Runner with RDS PostgreSQL and a managed or containerized graph layer."
  }
];

const apiExamples = [
  {
    method: "GET",
    path: "/api/health",
    text: "Checks Postgres chunk count and Neo4j node/relationship counts."
  },
  {
    method: "POST",
    path: "/api/rag",
    text: "Runs vector retrieval plus graph impact traversal for a CRE question."
  },
  {
    method: "GET",
    path: "/api/graph/impact?tenant=Northstar%20Logistics",
    text: "Returns tenant-space-lease-amendment-obligation paths from Neo4j."
  }
];

export default function Home() {
  const activeLeaseCount = graphEdges.filter((edge) => edge.type === "LEASES" && isActive(edge, new Date("2026-06-03"))).length;
  const highTrustFacts = graphEdges.filter((edge) => trustBand(edge.confidence) === "high").length;
  const extractionConfidence = Math.round(leaseExtractionExample.confidence * 100);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Network size={22} />
          </div>
          <div>
            <h1>CRE Knowledge Graph AI</h1>
            <p>Portfolio demo for Landmark-style property intelligence.</p>
          </div>
        </div>

        <nav className="nav-stack" aria-label="Demo sections">
          <button className="nav-item" type="button">
            <GitBranch size={17} />
            Context graph
          </button>
          <button className="nav-item" type="button">
            <Search size={17} />
            Entity resolution
          </button>
          <button className="nav-item" type="button">
            <Clock3 size={17} />
            Temporal facts
          </button>
          <button className="nav-item" type="button">
            <ShieldCheck size={17} />
            Trust review
          </button>
        </nav>

        <p>
          The demo connects fragmented lease, permit, tenant, and operations data into a temporal system of truth.
        </p>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="title-block">
            <h2>Industrial property context graph</h2>
            <p>
              A CRE intelligence layer that models assets, spaces, tenants, contracts, obligations, and source evidence
              as connected facts with time and confidence.
            </p>
          </div>
          <div className="status-pill">
            <CheckCircle2 size={17} />
            Reviewer-ready sample
          </div>
        </div>

        <section className="workspace" aria-label="Knowledge graph workspace">
          <div className="graph-panel">
            <div className="panel-header">
              <div>
                <h3>Buffalo Industrial Campus</h3>
                <p>Graph view with active lease, amendment, permit, and obligation relationships.</p>
              </div>
              <div className="tag-row">
                <span className="tag">Temporal</span>
                <span className="tag">Provenance</span>
                <span className="tag">GraphRAG-ready</span>
              </div>
            </div>
            <GraphView />
          </div>

          <aside className="right-rail" aria-label="Graph inspector">
            <div className="metric-grid">
              <Metric icon={<Building2 size={18} />} label="Entities" value={graphNodes.length.toString()} />
              <Metric icon={<ArrowRight size={18} />} label="Relationships" value={graphEdges.length.toString()} />
              <Metric icon={<Clock3 size={18} />} label="Active leases" value={activeLeaseCount.toString()} />
              <Metric icon={<Scale size={18} />} label="High-trust facts" value={highTrustFacts.toString()} />
            </div>

            <section className="inspector">
              <div className="section-title">
                <h3>Active relationship facts</h3>
                <span>2026-06-03</span>
              </div>
              <ul className="relationship-list">
                {relationshipHighlights.map((edge) => (
                  <li key={edge.id}>
                    <span className="eyebrow">{edge.type.replaceAll("_", " ")}</span>
                    <strong>{edge.label}</strong>
                    <p>{edge.evidence}</p>
                    <div className="confidence" aria-label={`Confidence ${Math.round(edge.confidence * 100)} percent`}>
                      <span style={{ width: `${edge.confidence * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="inspector">
              <div className="section-title">
                <h3>Lease extraction output</h3>
                <span>{extractionConfidence}% confidence</span>
              </div>
              <pre className="source-code">{JSON.stringify(leaseExtractionExample.fields, null, 2)}</pre>
            </section>

            <section className="inspector">
              <div className="section-title">
                <h3>Reasoning feed</h3>
                <span>Graph + evidence</span>
              </div>
              <ul className="feed">
                <FeedItem
                  icon={<AlertTriangle size={17} />}
                  title="CAM obligation changed by amendment"
                  text="Northstar Logistics is impacted because its active lease points to the 2026 CAM amendment."
                />
                <FeedItem
                  icon={<FileText size={17} />}
                  title="Permit linked to loading dock"
                  text="The loading dock permit is connected to Space 110 and should be included in tenant coordination."
                />
                <FeedItem
                  icon={<Layers3 size={17} />}
                  title="Occupancy is time-scoped"
                  text="The tenant-space relationship is active now but remains queryable as historical context after expiration."
                />
              </ul>
            </section>
          </aside>
        </section>

        <section className="platform-section" aria-label="Deployable AI engineering system">
          <div className="section-heading">
            <div>
              <h2>Deployable AI engineering architecture</h2>
              <p>
                The demo now runs as a containerized application with a local relational/vector database, a graph
                database, seeded data, and API routes that exercise the full RAG and graph path.
              </p>
            </div>
            <div className="status-pill">
              <Server size={17} />
              Docker compose ready
            </div>
          </div>

          <div className="system-grid">
            {systemLayers.map((layer) => (
              <article className="system-card" key={layer.title}>
                {layer.icon}
                <h3>{layer.title}</h3>
                <p>{layer.text}</p>
              </article>
            ))}
          </div>

          <div className="rag-panel">
            <div>
              <h3>RAG flow under the hood</h3>
              <ol className="pipeline-list">
                <li>Lease, amendment, and permit chunks are embedded and stored in `document_chunks.embedding`.</li>
                <li>`/api/rag` embeds the question and ranks chunks with pgvector cosine distance.</li>
                <li>The detected tenant is sent to Neo4j for lease, amendment, obligation, permit, and space traversal.</li>
                <li>The response returns answer text, citations, graph facts, and whether it used live databases.</li>
              </ol>
            </div>
            <pre className="source-code">{`curl -X POST http://localhost:3000/api/rag \\
  -H "Content-Type: application/json" \\
  -d '{"question":"What CAM obligation changed for Northstar?"}'`}</pre>
          </div>

          <div className="api-grid">
            {apiExamples.map((example) => (
              <article className="api-card" key={example.path}>
                <span className="method">{example.method}</span>
                <strong>{example.path}</strong>
                <p>{example.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function GraphView() {
  return (
    <svg className="graph-canvas" viewBox="0 0 760 560" role="img" aria-label="CRE property knowledge graph">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#87968a" />
        </marker>
      </defs>
      {graphEdges.map((edge) => {
        const source = nodePositions[edge.source];
        const target = nodePositions[edge.target];
        const labelX = (source.x + target.x) / 2 + 38;
        const labelY = (source.y + target.y) / 2 + 6;

        return (
          <g key={edge.id}>
            <line className="edge" x1={source.x + 132} y1={source.y + 28} x2={target.x} y2={target.y + 28} />
            <text className="edge-label" x={labelX} y={labelY}>
              {edge.type.replaceAll("_", " ")}
            </text>
          </g>
        );
      })}

      {graphNodes.map((node) => {
        const position = nodePositions[node.id];
        return (
          <g key={node.id} className="node-card" transform={`translate(${position.x}, ${position.y})`}>
            <rect width="142" height="62" rx="7" />
            <text className="node-type" x="12" y="20">
              {node.type}
            </text>
            <text x="12" y="42">
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <h3>{label}</h3>
      <div className="metric-value">{value}</div>
    </div>
  );
}

function FeedItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="feed-item">
      {icon}
      <strong>{title}</strong>
      <p>{text}</p>
    </li>
  );
}
