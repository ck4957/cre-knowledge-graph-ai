import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  Cloud,
  Database,
  FileText,
  GitBranch,
  Layers3,
  LineChart,
  Network,
  Percent,
  Scale,
  Search,
  Server,
  ShieldCheck
} from "lucide-react";
import {
  buildFinancialDashboard,
  calculateNoiSeries,
  calculateOccupancySeries,
  calculateRentSeries
} from "@/lib/financial/analytics";
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
    title: "Postgres + TypeORM",
    text: "Stores source documents, chunks, extraction events, entity-resolution candidates, and embeddings behind repositories."
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
    text: "Containerized app can deploy to ECS/App Runner with RDS PostgreSQL, migrations, and a managed graph layer."
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
  },
  {
    method: "CRUD",
    path: "/api/documents",
    text: "Creates, reads, updates, and deletes source documents and embedded chunks through TypeORM repositories."
  },
  {
    method: "POST",
    path: "/api/ingest/mls",
    text: "Pulls RESO/IDX listings, optionally geocodes addresses with Google Maps, and stores them as searchable chunks."
  },
  {
    method: "POST",
    path: "/api/ingest/pdf",
    text: "Parses uploaded PDFs and ingests the extracted text into the RAG document store."
  }
];

export default function Home() {
  const activeLeaseCount = graphEdges.filter((edge) => edge.type === "LEASES" && isActive(edge, new Date("2026-06-03"))).length;
  const highTrustFacts = graphEdges.filter((edge) => trustBand(edge.confidence) === "high").length;
  const extractionConfidence = Math.round(leaseExtractionExample.confidence * 100);
  const financialDashboard = buildFinancialDashboard();
  const rentSeries = calculateRentSeries(financialDashboard.monthly);
  const noiSeries = calculateNoiSeries(financialDashboard.monthly);
  const occupancySeries = calculateOccupancySeries(financialDashboard.monthly);

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

        <section className="platform-section" aria-label="Financial asset dashboard">
          <div className="section-heading">
            <div>
              <h2>Portfolio financial command center</h2>
              <p>
                Owners can track rent growth, NOI, occupancy, expense pressure, CAM recovery exposure, and lease
                rollover risk from the same lease intelligence layer.
              </p>
            </div>
            <div className="status-pill">
              <BarChart3 size={17} />
              Finance dashboard
            </div>
          </div>

          <div className="finance-kpi-grid">
            <Metric icon={<Banknote size={18} />} label="Monthly rent" value={formatCurrency(financialDashboard.kpis.grossRent)} />
            <Metric icon={<LineChart size={18} />} label="NOI" value={formatCurrency(financialDashboard.kpis.netOperatingIncome)} />
            <Metric icon={<Percent size={18} />} label="Occupancy" value={formatPercent(financialDashboard.kpis.occupancyRate)} />
            <Metric icon={<Scale size={18} />} label="Expense ratio" value={formatPercent(financialDashboard.kpis.expenseRatio)} />
          </div>

          <div className="chart-grid">
            <ChartPanel
              title="Rent and NOI trend"
              subtitle="Monthly gross rent vs. net operating income"
              legend={[
                { label: "Gross rent", color: "#27637a" },
                { label: "NOI", color: "#2f7d57" }
              ]}
            >
              <LineChartSvg
                series={[
                  { label: "Gross rent", color: "#27637a", points: rentSeries },
                  { label: "NOI", color: "#2f7d57", points: noiSeries }
                ]}
                valueFormatter={formatCompactCurrency}
              />
            </ChartPanel>

            <ChartPanel title="Occupancy trend" subtitle="Physical occupancy by month" legend={[{ label: "Occupancy", color: "#b47a2c" }]}>
              <LineChartSvg
                series={[{ label: "Occupancy", color: "#b47a2c", points: occupancySeries }]}
                valueFormatter={(value) => `${Math.round(value)}%`}
              />
            </ChartPanel>

            <ChartPanel title="Lease rollover risk" subtitle="Expiring rent by term bucket">
              <BarChartSvg
                bars={financialDashboard.leaseExpirations.map((bucket) => ({
                  label: bucket.label,
                  value: bucket.expiringRent,
                  note: `${bucket.leases} leases`
                }))}
                color="#27637a"
                valueFormatter={formatCompactCurrency}
              />
            </ChartPanel>

            <ChartPanel title="Expense mix" subtitle="Operating expense categories">
              <BarChartSvg
                bars={financialDashboard.expenseMix.map((expense) => ({
                  label: expense.category,
                  value: expense.amount
                }))}
                color="#a9493f"
                valueFormatter={formatCompactCurrency}
              />
            </ChartPanel>

            <ChartPanel title="CAM exposure" subtitle="Recoverable and owner-cost buckets">
              <BarChartSvg
                bars={financialDashboard.camExposure.map((expense) => ({
                  label: expense.category,
                  value: expense.amount
                }))}
                color="#2f7d57"
                valueFormatter={formatCompactCurrency}
              />
            </ChartPanel>
          </div>
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
                <li>Lease, amendment, and permit chunks are embedded and stored through TypeORM migrations.</li>
                <li>`/api/rag` embeds the question and ranks persisted chunks with a testable retrieval service.</li>
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

function ChartPanel({
  title,
  subtitle,
  legend,
  children
}: {
  title: string;
  subtitle: string;
  legend?: Array<{ label: string; color: string }>;
  children: React.ReactNode;
}) {
  return (
    <article className="chart-panel">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {legend ? (
          <div className="chart-legend">
            {legend.map((item) => (
              <span key={item.label}>
                <i style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </article>
  );
}

function LineChartSvg({
  series,
  valueFormatter
}: {
  series: Array<{ label: string; color: string; points: Array<{ label: string; value: number }> }>;
  valueFormatter: (value: number) => string;
}) {
  const values = series.flatMap((item) => item.points.map((point) => point.value));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = 640;
  const height = 260;
  const padding = { top: 22, right: 22, bottom: 38, left: 58 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const labels = series[0]?.points.map((point) => point.label) ?? [];

  const xFor = (index: number) => padding.left + (labels.length <= 1 ? 0 : (index / (labels.length - 1)) * chartWidth);
  const yFor = (value: number) => padding.top + chartHeight - ((value - min) / Math.max(1, max - min)) * chartHeight;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
      <line className="axis-line" x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} />
      <line className="axis-line" x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} />
      {[0, 0.5, 1].map((step) => {
        const value = min + (max - min) * step;
        const y = yFor(value);
        return (
          <g key={step}>
            <line className="grid-line" x1={padding.left} y1={y} x2={width - padding.right} y2={y} />
            <text className="chart-axis-label" x={8} y={y + 4}>
              {valueFormatter(value)}
            </text>
          </g>
        );
      })}
      {series.map((item) => {
        const d = item.points.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point.value)}`).join(" ");
        return (
          <g key={item.label}>
            <path className="line-path" d={d} style={{ stroke: item.color }} />
            {item.points.map((point, index) => (
              <circle key={`${item.label}-${point.label}`} cx={xFor(index)} cy={yFor(point.value)} r="4" fill={item.color} />
            ))}
          </g>
        );
      })}
      {labels.map((label, index) => (
        <text key={label} className="chart-axis-label" x={xFor(index)} y={height - 12} textAnchor="middle">
          {label}
        </text>
      ))}
    </svg>
  );
}

function BarChartSvg({
  bars,
  color,
  valueFormatter
}: {
  bars: Array<{ label: string; value: number; note?: string }>;
  color: string;
  valueFormatter: (value: number) => string;
}) {
  const width = 640;
  const height = 260;
  const padding = { top: 20, right: 24, bottom: 56, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(...bars.map((bar) => bar.value));
  const gap = 16;
  const barWidth = (chartWidth - gap * (bars.length - 1)) / bars.length;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
      <line className="axis-line" x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} />
      <line className="axis-line" x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} />
      {bars.map((bar, index) => {
        const x = padding.left + index * (barWidth + gap);
        const barHeight = (bar.value / Math.max(1, max)) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        return (
          <g key={bar.label}>
            <rect className="bar-rect" x={x} y={y} width={barWidth} height={barHeight} rx="5" style={{ fill: color }} />
            <text className="bar-value" x={x + barWidth / 2} y={Math.max(14, y - 8)} textAnchor="middle">
              {valueFormatter(bar.value)}
            </text>
            <text className="chart-axis-label" x={x + barWidth / 2} y={height - 32} textAnchor="middle">
              {bar.label}
            </text>
            {bar.note ? (
              <text className="chart-axis-label" x={x + barWidth / 2} y={height - 14} textAnchor="middle">
                {bar.note}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
