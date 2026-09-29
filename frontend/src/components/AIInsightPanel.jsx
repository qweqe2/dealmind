import DealRiskCard from "./DealRiskCard";
import { Link } from "react-router-dom";

export default function AIInsightPanel({ deals = [], loading = false }) {
  const attentionDeals = deals.filter(deal => deal.status === "needs_attention");
  const totalDeals = deals.length;
  const attentionCount = attentionDeals.length;
  
  if (loading) {
    return (
      <section className="ai-insight-panel ai-insight-panel--loading">
        <div className="ai-insight-panel-header">
          <span className="ai-insight-panel-icon" aria-hidden="true">✳</span>
          <div>
            <p className="eyebrow">AI PIPELINE INTELLIGENCE</p>
            <h2>Analyzing your pipeline...</h2>
          </div>
        </div>
        <div className="ai-insight-panel-loading">
          <span className="loading-spinner" />
        </div>
      </section>
    );
  }

  return (
    <section className="ai-insight-panel">
      <div className="ai-insight-panel-header">
        <span className="ai-insight-panel-icon" aria-hidden="true">✳</span>
        <div>
          <p className="eyebrow">AI PIPELINE INTELLIGENCE</p>
          <h2>
            {attentionCount > 0 
              ? `${attentionCount} deal${attentionCount !== 1 ? 's' : ''} need attention`
              : "Pipeline is healthy"
            }
          </h2>
        </div>
        {totalDeals > 0 && (
          <div className="ai-insight-panel-stats">
            <div className="ai-insight-panel-stat">
              <span className="ai-insight-panel-stat-label">Total pipeline</span>
              <strong className="ai-insight-panel-stat-value">{totalDeals}</strong>
            </div>
            <div className="ai-insight-panel-stat">
              <span className="ai-insight-panel-stat-label">Deals analyzed</span>
              <strong className="ai-insight-panel-stat-value">{totalDeals}</strong>
            </div>
            <div className="ai-insight-panel-stat">
              <span className="ai-insight-panel-stat-label">Needs attention</span>
              <strong className={`ai-insight-panel-stat-value ${attentionCount > 0 ? 'ai-insight-panel-stat-value--alert' : ''}`}>
                {attentionCount}
              </strong>
            </div>
          </div>
        )}
      </div>

      {attentionCount > 0 ? (
        <div className="ai-insight-panel-deals">
          <p className="ai-insight-panel-intro">
            These deals have signals that may require your attention:
          </p>
          <div className="ai-insight-panel-deals-list">
            {attentionDeals.slice(0, 3).map(deal => (
              <DealRiskCard 
                key={deal.id} 
                deal={deal}
                onInvestigate={() => {/* Navigate to assistant */}}
                onOpen={() => {/* Navigate to detail */}}
              />
            ))}
            {attentionDeals.length > 3 && (
              <Link className="ai-insight-panel-view-all" to="/deals">
                View all {attentionDeals.length} deals needing attention →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="ai-insight-panel-healthy">
          <span className="ai-insight-panel-healthy-icon" aria-hidden="true">✓</span>
          <div>
            <h3>All deals on track</h3>
            <p>Your pipeline momentum is strong. Continue monitoring for early risk signals.</p>
          </div>
        </div>
      )}
    </section>
  );
}
