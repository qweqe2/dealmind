/**
 * TeamComparison Component
 * Side-by-side comparison of multiple teams
 */

export default function TeamComparison({ teams = [], onClose }) {
  if (teams.length === 0) {
    return (
      <div className="team-comparison team-comparison--empty">
        <p>Select teams to compare</p>
      </div>
    );
  }

  // Check if any teams have derived metrics
  const hasDerivedMetrics = teams.some(team => team.hasDerivedMetrics || team.dataSource === 'demo' || !team.dataSource);

  const metrics = [
    { key: 'aiScore', label: 'AI Score', format: (v) => `${v}%` },
    { key: 'technicalFit', label: 'Technical Fit', format: (v) => `${v}%` },
    { key: 'marketFit', label: 'Market Fit', format: (v) => `${v}%` },
    { key: 'teamExperience', label: 'Experience', format: (v) => `${v}%` },
    { key: 'riskScore', label: 'Risk Score', format: (v) => `${v}%`, inverse: true },
    { key: 'teamSize', label: 'Team Size', format: (v) => v },
    { key: 'foundedYear', label: 'Founded', format: (v) => v },
  ];

  const getMaxValue = (key) => {
    return Math.max(...teams.map(t => t[key] || 0));
  };

  return (
    <div className="team-comparison">
      <div className="comparison-header">
        <div>
          <p className="eyebrow">TEAM COMPARISON</p>
          <h2>Compare {teams.length} Teams</h2>
          {hasDerivedMetrics && (
            <span className="data-source data-source--demo">Derived AI metrics</span>
          )}
        </div>
        <button 
          className="close-comparison"
          onClick={onClose}
          type="button"
          aria-label="Close comparison"
        >
          ×
        </button>
      </div>

      <div className="comparison-grid">
        {/* Team headers */}
        <div className="comparison-header-row">
          <div className="comparison-metric-label">Metric</div>
          {teams.map(team => (
            <div key={team.id} className="comparison-team-header">
              <h3>{team.teamName}</h3>
              <p>{team.projectName}</p>
              <span className="comparison-team-score">{team.aiScore}% AI Score</span>
            </div>
          ))}
        </div>

        {/* Metrics rows */}
        {metrics.map(metric => (
          <div key={metric.key} className="comparison-row">
            <div className="comparison-metric-label">{metric.label}</div>
            {teams.map(team => {
              const value = team[metric.key];
              const maxValue = getMaxValue(metric.key);
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const inverse = metric.inverse;
              const isDerived = team.hasDerivedMetrics || team.dataSource === 'demo';
              
              return (
                <div key={team.id} className="comparison-cell">
                  <div className="comparison-value">
                    {metric.format(value)}
                    {isDerived && metric.key === 'aiScore' && (
                      <span className="comparison-derived">Derived</span>
                    )}
                  </div>
                  <div className="comparison-bar">
                    <div 
                      className={`comparison-bar-fill ${inverse ? 'comparison-bar-fill--inverse' : ''}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Selection reasoning */}
        <div className="comparison-row comparison-row--full">
          <div className="comparison-metric-label">Selection Reasoning</div>
          {teams.map(team => (
            <div key={team.id} className="comparison-cell comparison-cell--text">
              <p>{team.selectionReasoning}</p>
            </div>
          ))}
        </div>

        {/* Key strengths */}
        <div className="comparison-row comparison-row--full">
          <div className="comparison-metric-label">Key Strengths</div>
          {teams.map(team => (
            <div key={team.id} className="comparison-cell comparison-cell--tags">
              <div className="comparison-tags">
                {team.keyStrengths?.map((strength, index) => (
                  <span key={index} className="comparison-tag">{strength}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Risk factors */}
        <div className="comparison-row comparison-row--full">
          <div className="comparison-metric-label">Risk Factors</div>
          {teams.map(team => (
            <div key={team.id} className="comparison-cell comparison-cell--text">
              {team.riskFactors?.length > 0 ? (
                <ul className="comparison-risks">
                  {team.riskFactors.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-risks">No significant risks identified</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="comparison-actions">
        <button className="comparison-action comparison-action--primary" type="button">
          Shortlist Top Performer
        </button>
        <button className="comparison-action comparison-action--secondary" type="button">
          Add to Review Queue
        </button>
        <button className="comparison-action comparison-action--secondary" type="button">
          Export Comparison
        </button>
      </div>
    </div>
  );
}
