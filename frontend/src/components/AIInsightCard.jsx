export default function AIInsightCard({ 
  attentionCount, 
  totalDeals, 
  deals = [],
  loading = false 
}) {
  if (loading) {
    return (
      <article className="ai-insight-card ai-insight-card--loading">
        <div className="ai-insight-header">
          <span className="ai-insight-icon" aria-hidden="true">✳</span>
          <div>
            <p className="ai-insight-label">AI DEAL INTELLIGENCE</p>
            <h3 className="ai-insight-title">Analyzing your pipeline...</h3>
          </div>
        </div>
        <div className="ai-insight-loading">
          <span className="loading-spinner" />
        </div>
      </article>
    );
  }

  const attentionDeals = deals.filter(deal => deal.status === "needs_attention");
  const onTrackDeals = deals.filter(deal => deal.status === "on_track");
  
  return (
    <article className="ai-insight-card">
      <div className="ai-insight-header">
        <span className="ai-insight-icon" aria-hidden="true">✳</span>
        <div>
          <p className="ai-insight-label">AI DEAL INTELLIGENCE</p>
          <h3 className="ai-insight-title">
            {attentionCount > 0 
              ? `${attentionCount} deal${attentionCount !== 1 ? 's' : ''} need attention`
              : "Pipeline is healthy"
            }
          </h3>
        </div>
      </div>
      
      <div className="ai-insight-content">
        {attentionCount > 0 ? (
          <div className="ai-insight-alert">
            <span className="ai-insight-alert-icon">⚠</span>
            <div className="ai-insight-alert-content">
              <p className="ai-insight-alert-title">Focus on these deals</p>
              <p className="ai-insight-alert-description">
                {attentionDeals.slice(0, 3).map(deal => deal.company).join(", ")}
                {attentionDeals.length > 3 && ` and ${attentionDeals.length - 3} more`}
              </p>
            </div>
          </div>
        ) : (
          <div className="ai-insight-success">
            <span className="ai-insight-success-icon">✓</span>
            <div className="ai-insight-success-content">
              <p className="ai-insight-success-title">All deals on track</p>
              <p className="ai-insight-success-description">
                Your pipeline momentum is strong. Continue monitoring for early risk signals.
              </p>
            </div>
          </div>
        )}
        
        {totalDeals > 0 && (
          <div className="ai-insight-metrics">
            <div className="ai-insight-metric">
              <span className="ai-insight-metric-label">On track</span>
              <strong className="ai-insight-metric-value">{onTrackDeals.length}</strong>
            </div>
            <div className="ai-insight-metric">
              <span className="ai-insight-metric-label">Needs attention</span>
              <strong className="ai-insight-metric-value ai-insight-metric-value--alert">{attentionCount}</strong>
            </div>
            <div className="ai-insight-metric">
              <span className="ai-insight-metric-label">Total pipeline</span>
              <strong className="ai-insight-metric-value">{totalDeals}</strong>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}