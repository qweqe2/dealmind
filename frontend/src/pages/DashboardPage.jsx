import { Link } from "react-router-dom";
import DealTable from "../components/DealTable";
import StatCard from "../components/StatCard";
import AIInsightPanel from "../components/AIInsightPanel";
import PipelineOverview from "../components/PipelineOverview";

export default function DashboardPage({ deals, loading, error, backendOnline, dataSource }) {
  const attentionCount = deals.filter((deal) => deal.status === "needs_attention").length;
  const analyzedCount = deals.length;
  
  // Calculate pipeline value if deals have value field
  const pipelineValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const formattedValue = new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 0,
    notation: "compact"
  }).format(pipelineValue);

  // Calculate pipeline momentum (deals with recent activity)
  const recentActivityCutoff = new Date();
  recentActivityCutoff.setDate(recentActivityCutoff.getDate() - 7);
  const momentumCount = deals.filter(deal => {
    if (!deal.last_activity) return false;
    const lastActivity = new Date(deal.last_activity);
    return lastActivity >= recentActivityCutoff;
  }).length;

  return (
    <>
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p className="eyebrow">DEAL INTELLIGENCE</p>
          <h1>Your pipeline has signals.</h1>
          <p className="dashboard-hero-subtitle">We find the ones you might miss.</p>
        </div>
        {dataSource === "demo" && (
          <div className="data-source-badge data-source-badge--demo">
            DEMO DATA
          </div>
        )}
        {dataSource === "api" && (
          <div className="data-source-badge data-source-badge--live">
            LIVE DATA
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="dashboard-stats" aria-label="Pipeline metrics">
        <StatCard 
          label="Total pipeline" 
          value={loading ? "…" : deals.length} 
          note="Deals in your pipeline"
          accent="mint"
          loading={loading}
        />
        <StatCard 
          label="Deals analyzed" 
          value={loading ? "…" : analyzedCount} 
          note="By AI intelligence"
          accent="mint"
          loading={loading}
        />
        <StatCard 
          label="Needs attention" 
          value={loading ? "…" : attentionCount} 
          note="Flagged for follow-up"
          accent={attentionCount > 0 ? "coral" : "mint"}
          loading={loading}
        />
        <StatCard 
          label="Pipeline momentum" 
          value={loading ? "…" : momentumCount} 
          note="Active in last 7 days"
          accent="mint"
          loading={loading}
        />
      </section>

      {/* AI Pipeline Intelligence - Centerpiece */}
      <section className="dashboard-intelligence">
        <AIInsightPanel 
          deals={deals}
          loading={loading}
        />
      </section>

      {error && <div className="notice" role="status"><span className="notice-icon" aria-hidden="true">i</span><p><strong>Deal data is not available yet.</strong> {backendOnline ? <>The backend is responding, but <code>GET /api/deals</code> is not implemented in the current API.</> : "The configured backend could not be reached. Confirm the API is running at its configured base URL."}</p></div>}

      {/* Pipeline Distribution */}
      <section className="dashboard-section">
        <PipelineOverview 
          deals={deals}
          loading={loading}
        />
      </section>

      {/* Recent Deals */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR PIPELINE</p>
            <h2>Recent deals</h2>
          </div>
          <Link className="text-action" to="/deals">View all deals <span aria-hidden="true">→</span></Link>
        </div>
        <div className="data-panel">
          <DealTable deals={deals} loading={loading} error={error} compact />
        </div>
      </section>

      {/* System Status */}
      <section className="dashboard-section dashboard-section--compact">
        <article className="status-panel">
          <div className="section-heading section-heading--compact">
            <div>
              <p className="eyebrow">CONNECTION</p>
              <h2>System status</h2>
            </div>
            <span className={`system-indicator${backendOnline === false ? " system-indicator--offline" : ""}`} />
          </div>
          <div className="system-row">
            <span>Backend health</span>
            <strong>{backendOnline === null ? "Checking" : backendOnline ? "Operational" : "Unavailable"}</strong>
          </div>
          <div className="system-row">
            <span>Deal data</span>
            <strong>{loading ? "Loading" : error ? "Not available" : dataSource === "demo" ? "Demo preview" : "Live data"}</strong>
          </div>
          <div className="system-row">
            <span>API base URL</span>
            <strong className="url-value">{import.meta.env.VITE_API_URL || "127.0.0.1:8000"}</strong>
          </div>
        </article>
      </section>
    </>
  );
}