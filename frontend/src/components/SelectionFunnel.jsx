/**
 * SelectionFunnel Component
 * Visualizes the team selection workflow: 30,000 → matched → qualified → shortlisted → 60 selected
 */

export default function SelectionFunnel({ funnel = [], loading = false }) {
  if (loading) {
    return (
      <div className="selection-funnel selection-funnel--loading">
        <div className="funnel-loading">
          <span className="loading-spinner" />
          <span>Analyzing teams...</span>
        </div>
      </div>
    );
  }

  if (!funnel || funnel.length === 0) {
    return (
      <div className="selection-funnel selection-funnel--empty">
        <p>No funnel data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...funnel.map(f => f.count));
  
  return (
    <div className="selection-funnel">
      <div className="funnel-header">
        <p className="eyebrow">SELECTION FUNNEL</p>
        <h2>AI Selection Progress</h2>
      </div>
      
      <div className="funnel-stages">
        {funnel.map((stage, index) => {
          const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const isFinal = index === funnel.length - 1;
          
          return (
            <div 
              key={stage.stage} 
              className={`funnel-stage ${isFinal ? 'funnel-stage--final' : ''}`}
            >
              <div className="funnel-stage-info">
                <span className="funnel-stage-name">{stage.stage}</span>
                <span className="funnel-stage-count">
                  {stage.count.toLocaleString()}
                </span>
                <span className="funnel-stage-percentage">
                  {stage.percentage}%
                </span>
              </div>
              
              <div className="funnel-stage-bar">
                <div 
                  className="funnel-stage-fill" 
                  style={{ width: `${width}%` }}
                />
              </div>
              
              {index < funnel.length - 1 && (
                <div className="funnel-stage-arrow" aria-hidden="true">
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="funnel-summary">
        <span className="funnel-summary-label">
          AI is analyzing {funnel[0]?.count?.toLocaleString() || '30,000'} teams to identify the {funnel[funnel.length - 1]?.count || '60'} strongest candidates
        </span>
      </div>
    </div>
  );
}
