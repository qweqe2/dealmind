export default function PipelineOverview({ deals = [], loading = false }) {
  if (loading) {
    return (
      <section className="pipeline-overview pipeline-overview--loading">
        <div className="pipeline-overview-header">
          <p className="eyebrow">PIPELINE DISTRIBUTION</p>
          <h2>Stage breakdown</h2>
        </div>
        <div className="pipeline-overview-loading">
          <span className="loading-spinner" />
        </div>
      </section>
    );
  }

  const stageDistribution = deals.reduce((acc, deal) => {
    const stage = deal.stage || "Unknown";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const totalDeals = deals.length;
  const stages = Object.entries(stageDistribution).sort((a, b) => b[1] - a[1]);

  if (totalDeals === 0) {
    return (
      <section className="pipeline-overview">
        <div className="pipeline-overview-header">
          <p className="eyebrow">PIPELINE DISTRIBUTION</p>
          <h2>Stage breakdown</h2>
        </div>
        <p className="pipeline-overview-empty">No deals in pipeline</p>
      </section>
    );
  }

  return (
    <section className="pipeline-overview">
      <div className="pipeline-overview-header">
        <p className="eyebrow">PIPELINE DISTRIBUTION</p>
        <h2>Stage breakdown</h2>
        <span className="pipeline-overview-total">{totalDeals} deals</span>
      </div>
      
      <div className="pipeline-overview-bars">
        {stages.map(([stage, count]) => {
          const percentage = (count / totalDeals) * 100;
          return (
            <div key={stage} className="pipeline-overview-bar">
              <div className="pipeline-overview-bar-label">
                <span>{stage}</span>
                <span className="pipeline-overview-bar-count">{count}</span>
              </div>
              <div className="pipeline-overview-bar-track">
                <div 
                  className="pipeline-overview-bar-fill" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="pipeline-overview-bar-percentage">{Math.round(percentage)}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
