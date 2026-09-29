/**
 * SelectionMetrics Component
 * Displays key AI selection metrics for the dashboard
 * 
 * DATA TRANSPARENCY: Shows when metrics are derived from deal data vs. real team selection API
 */

export default function SelectionMetrics({ metrics = {}, loading = false }) {
  const {
    totalTeams = 30000,
    analyzed = 0,
    matched = 0,
    qualified = 0,
    shortlisted = 0,
    selected = 0,
    selectionPercentage = 0,
    requiringReview = 0,
    hasMockTotal = false
  } = metrics;

  const metricCards = [
    {
      label: 'Total Teams',
      value: totalTeams.toLocaleString(),
      note: hasMockTotal ? 'Demo pool size' : 'In selection pool',
      accent: 'mint',
      loading,
      isDemo: hasMockTotal
    },
    {
      label: 'Teams Analyzed',
      value: analyzed.toLocaleString(),
      note: 'By AI screening',
      accent: 'mint',
      loading
    },
    {
      label: 'Teams Matched',
      value: matched.toLocaleString(),
      note: 'Passed initial screening',
      accent: 'mint',
      loading
    },
    {
      label: 'Teams Qualified',
      value: qualified.toLocaleString(),
      note: 'Meet core criteria',
      accent: 'mint',
      loading
    },
    {
      label: 'Teams Shortlisted',
      value: shortlisted.toLocaleString(),
      note: 'Top candidates',
      accent: selected > 0 ? 'coral' : 'mint',
      loading
    },
    {
      label: 'Final Selections',
      value: selected.toLocaleString(),
      note: `${selectionPercentage}% of pool`,
      accent: selected > 0 ? 'coral' : 'mint',
      loading,
      highlight: true
    },
    {
      label: 'Requiring Review',
      value: requiringReview.toLocaleString(),
      note: 'Need human evaluation',
      accent: requiringReview > 0 ? 'coral' : 'mint',
      loading
    }
  ];

  return (
    <div className="selection-metrics">
      <div className="metrics-header">
        <p className="eyebrow">AI SELECTION METRICS</p>
        <h2>Selection Progress</h2>
        {hasMockTotal && (
          <span className="data-source data-source--demo">Demo pool size</span>
        )}
      </div>
      
      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
          <div 
            key={metric.label} 
            className={`metric-card ${metric.highlight ? 'metric-card--highlight' : ''} ${metric.isDemo ? 'metric-card--demo' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="metric-card-label">{metric.label}</span>
            <strong className="metric-card-value">
              {loading ? '...' : metric.value}
            </strong>
            <span className="metric-card-note">{metric.note}</span>
            <span className={`metric-card-accent metric-card-accent--${metric.accent}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
