/**
 * TeamRankingCard Component
 * Displays individual team candidates with AI scores, match explanations, and selection reasoning
 */

import { useState } from 'react';

const SELECTION_STAGE_LABELS = {
  'screened': 'Screened',
  'matched': 'Matched',
  'qualified': 'Qualified',
  'shortlisted': 'Shortlisted',
  'selected': 'Selected',
  'rejected': 'Rejected',
  'review': 'Review'
};

const SELECTION_STAGE_COLORS = {
  'screened': '#9aa29d',
  'matched': '#7ba488',
  'qualified': '#578369',
  'shortlisted': '#4a7a5a',
  'selected': '#2d5a3f',
  'rejected': '#c87660',
  'review': '#b8a890'
};

export default function TeamRankingCard({ team, onSelect, isSelected, onViewDetails }) {
  const [expanded, setExpanded] = useState(false);
  
  const stageColor = SELECTION_STAGE_COLORS[team.selectionStage] || '#9aa29d';
  const stageLabel = SELECTION_STAGE_LABELS[team.selectionStage] || team.selectionStage;
  
  const scoreColor = team.aiScore >= 90 ? '#2d5a3f' : 
                    team.aiScore >= 80 ? '#4a7a5a' : 
                    team.aiScore >= 70 ? '#578369' : '#7ba488';
  
  const hasDerivedMetrics = team.hasDerivedMetrics || team.dataSource === 'demo';

  return (
    <article 
      className={`team-ranking-card ${isSelected ? 'team-ranking-card--selected' : ''}`}
      onClick={() => onSelect?.(team.id)}
    >
      <div className="team-card-header">
        <div className="team-card-rank">
          <span className="rank-number">#{team.rank}</span>
        </div>
        
        <div className="team-card-identity">
          <h3 className="team-name">{team.teamName}</h3>
          <p className="project-name">{team.projectName}</p>
          <div className="team-meta">
            <span className="team-industry">{team.industry}</span>
            <span className="team-location">{team.location}</span>
          </div>
        </div>
        
        <div className="team-card-score">
          <div className="ai-score-badge" style={{ backgroundColor: scoreColor }}>
            <span className="ai-score-value">{team.aiScore}</span>
            <span className="ai-score-label">AI Score</span>
            {hasDerivedMetrics && (
              <span className="ai-score-derived" title="AI score derived from deal data for demonstration">Derived</span>
            )}
          </div>
          <span className="match-percentage">{team.matchPercentage}% match</span>
        </div>
        
        <div className="team-card-stage">
          <span 
            className="stage-badge" 
            style={{ color: stageColor, borderColor: stageColor }}
          >
            {stageLabel}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="team-card-details">
          <div className="team-card-section">
            <h4>Why AI Selected This Team</h4>
            <p className="selection-reasoning">{team.selectionReasoning}</p>
          </div>
          
          <div className="team-card-metrics">
            <div className="team-metric">
              <span>Technical Fit</span>
              <strong>{team.technicalFit}%</strong>
            </div>
            <div className="team-metric">
              <span>Market Fit</span>
              <strong>{team.marketFit}%</strong>
            </div>
            <div className="team-metric">
              <span>Experience</span>
              <strong>{team.teamExperience}%</strong>
            </div>
            <div className="team-metric">
              <span>Risk Score</span>
              <strong className="risk-metric">{team.riskScore}%</strong>
            </div>
          </div>
          
          {team.keyStrengths && team.keyStrengths.length > 0 && (
            <div className="team-card-section">
              <h4>Key Strengths</h4>
              <div className="strengths-list">
                {team.keyStrengths.map((strength, index) => (
                  <span key={index} className="strength-tag">{strength}</span>
                ))}
              </div>
            </div>
          )}
          
          {team.riskFactors && team.riskFactors.length > 0 && (
            <div className="team-card-section">
              <h4>Risk Indicators</h4>
              <div className="risks-list">
                {team.riskFactors.map((risk, index) => (
                  <div key={index} className="risk-item">
                    <span className="risk-icon">⚠</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="team-card-actions">
            <button 
              className="team-card-action team-card-action--primary"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(team);
              }}
              type="button"
            >
              View Full Details
            </button>
            <button 
              className="team-card-action team-card-action--secondary"
              onClick={(e) => {
                e.stopPropagation();
                // Add to comparison or other action
              }}
              type="button"
            >
              Compare
            </button>
          </div>
        </div>
      )}
      
      <button 
        className="expand-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        type="button"
        aria-expanded={expanded}
      >
        <span className="expand-icon">{expanded ? '−' : '+'}</span>
        <span className="expand-label">{expanded ? 'Show less' : 'Show more'}</span>
      </button>
    </article>
  );
}
