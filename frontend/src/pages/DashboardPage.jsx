import { Link } from "react-router-dom";
import DealTable from "../components/DealTable";

export default function DashboardPage({ deals, loading, error, backendOnline, dataSource }) {
  const attentionCount = deals.filter((deal) => deal.status === "needs_attention").length;

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">DEAL INTELLIGENCE</p>
          <h1>Good deals start with clarity.</h1>
          <p className="page-subtitle">A live view of your pipeline, priorities, and deal momentum.</p>
        </div>
        <span className="date-stamp">PORTFOLIO OVERVIEW</span>
      </section>

      {dataSource === "demo" && <div className="demo-banner">DEMO DATA <span>Sample pipeline shown while live deal data is unavailable.</span></div>}

      <section className="metric-grid" aria-label="Deal portfolio metrics">
        <article className="metric-panel"><span className="metric-label">Total deals</span><strong>{loading ? "…" : error ? "—" : deals.length}</strong><span className="metric-note">Across your pipeline</span><span className="metric-accent metric-accent--mint" /></article>
        <article className="metric-panel"><span className="metric-label">Needs attention</span><strong>{loading ? "…" : error ? "—" : attentionCount}</strong><span className="metric-note">Flagged for follow-up</span><span className="metric-accent metric-accent--coral" /></article>
        <article className="metric-panel metric-panel--dark"><span className="metric-label">Pipeline health</span><strong>{loading ? "…" : error ? "Pending" : deals.length ? "In motion" : "Clear"}</strong><span className="metric-note">Based on current deal status</span><span className="health-mark" aria-hidden="true">↗</span></article>
      </section>

      {error && <div className="notice" role="status"><span className="notice-icon" aria-hidden="true">i</span><p><strong>Deal data is not available yet.</strong> {backendOnline ? <>The backend is responding, but <code>GET /api/deals</code> is not implemented in the current API.</> : "The configured backend could not be reached. Confirm the API is running at its configured base URL."}</p></div>}

      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">YOUR PIPELINE</p><h2>Recent deals</h2></div><Link className="text-action" to="/deals">View all deals <span aria-hidden="true">→</span></Link></div>
        <div className="data-panel"><DealTable deals={deals} loading={loading} error={error} compact /></div>
      </section>

      <section className="bottom-grid">
        <article className="insight-panel"><div className="panel-kicker"><span className="panel-kicker-mark" /> DEAL SIGNAL</div><h2>Keep the full story close.</h2><p>Deal timelines and meeting memory bring important context into each opportunity.</p><div className="insight-footer"><span>Timeline</span><span>Memory</span><span>Risks</span></div></article>
        <article className="status-panel"><div className="section-heading section-heading--compact"><div><p className="eyebrow">CONNECTION</p><h2>System status</h2></div><span className={`system-indicator${backendOnline === false ? " system-indicator--offline" : ""}`} /></div><div className="system-row"><span>Backend health</span><strong>{backendOnline === null ? "Checking" : backendOnline ? "Operational" : "Unavailable"}</strong></div><div className="system-row"><span>Deal data</span><strong>{loading ? "Loading" : error ? "Not available" : dataSource === "demo" ? "Demo preview" : "Synced"}</strong></div><div className="system-row"><span>API base URL</span><strong className="url-value">{import.meta.env.VITE_API_URL || "127.0.0.1:8000"}</strong></div></article>
      </section>
    </>
  );
}