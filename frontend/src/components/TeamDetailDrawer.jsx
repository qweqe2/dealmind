/**
 * TeamDetailDrawer Component
 * Slide-over drawer for detailed team information without navigation
 */

import { useEffect } from 'react';

export default function TeamDetailDrawer({ team, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !team) return null;

  const hasDerivedMetrics = team.hasDerivedMetrics || team.dataSource === 'demo' || !team.dataSource;

  return (
    <div className="team-detail-drawer-overlay" onClick={onClose}>
      <div className="team-detail-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">TEAM DETAILS</p>
            <h2>{team.teamName}</h2>
            <p className="drawer-subtitle">{team.projectName}</p>
            {hasDerivedMetrics && (
              <span className="data-source data-source--demo">Derived AI metrics</span>
            )}
          </div>
          <button 
            className="drawer-close"
            onClick={onClose}
            type="button"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>

        <div className="drawer-content">
          {/* AI Explainability Panel */}
          <section className="drawer-section drawer-section--highlight">
            <div className="section-header">
              <span className="section-icon" aria-hidden="true">✳</span>
              <div>
                <p className="eyebrow">AI EXPLAINABILITY</p>
                <h3>Why AI Selected This Team</h3>
              </div>
            </div>
            <div className="ai-explanation">
              <p className="selection-reasoning">{team.selectionReasoning}</p>
              
              {hasDerivedMetrics && (
                <div className="data-transparency-note">
                  <span className="transparency-icon">ℹ</span>
                  <p>AI scores and team metrics are derived from deal data for demonstration. In production, these would come from dedicated team selection AI analysis.</p>
                </div>
              )}
              
              <div className="explanation-factors">
                <h4>Key Selection Factors</h4>
                <div className="factors-grid">
                  <div className="factor-item">
                    <span className="factor-label">AI Score</span>
                    <strong className="factor-value">{team.aiScore}%</strong>
                    {hasDerivedMetrics && <span className="factor-derived">Derived</span>}
                  </div>
                  <div className="factor-item">
                    <span className="factor-label">Technical Fit</span>
                    <strong className="factor-value">{team.technicalFit}%</strong>
                    {hasDerivedMetrics && <span className="factor-derived">Derived</span>}
                  </div>
                  <div className="factor-item">
                    <span className="factor-label">Market Fit</span>
                    <strong className="factor-value">{team.marketFit}%</strong>
                    {hasDerivedMetrics && <span className="factor-derived">Derived</span>}
                  </div>
                  <div className="factor-item">
                    <span className="factor-label">Experience</span>
                    <strong className="factor-value">{team.teamExperience}%</strong>
                    {hasDerivedMetrics && <span className="factor-derived">Derived</span>}
                  </div>
                  <div className="factor-item">
                    <span className="factor-label">Risk Score</span>
                    <strong className="factor-value factor-value--risk">{team.riskScore}%</strong>
                    {hasDerivedMetrics && <span className="factor-derived">Derived</span>}
                  </div>
                  <div className="factor-item">
                    <span className="factor-label">Selection Stage</span>
                    <strong className="factor-value">{team.selectionStage}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Information */}
          <section className="drawer-section">
            <div className="section-header">
              <p className="eyebrow">TEAM INFORMATION</p>
              <h3>Overview</h3>
            </div>
            <div className="team-info-grid">
              <div className="info-item">
                <span>Industry</span>
                <strong>{team.industry}</strong>
              </div>
              <div className="info-item">
                <span>Location</span>
                <strong>{team.location}</strong>
              </div>
              <div className="info-item">
                <span>Team Size</span>
                <strong>{team.teamSize} members</strong>
              </div>
              <div className="info-item">
                <span>Founded</span>
                <strong>{team.foundedYear}</strong>
              </div>
              <div className="info-item">
                <span>Funding Stage</span>
                <strong>{team.fundingStage}</strong>
              </div>
              <div className="info-item">
                <span>Current Rank</span>
                <strong>#{team.rank}</strong>
              </div>
            </div>
          </section>

          {/* Key Strengths */}
          {team.keyStrengths && team.keyStrengths.length > 0 && (
            <section className="drawer-section">
              <div className="section-header">
                <p className="eyebrow">STRENGTHS</p>
                <h3>Key Strengths</h3>
              </div>
              <div className="strengths-list">
                {team.keyStrengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <span className="strength-icon">✓</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Risk Factors */}
          {team.riskFactors && team.riskFactors.length > 0 && (
            <section className="drawer-section">
              <div className="section-header">
                <p className="eyebrow">RISKS</p>
                <h3>Risk Indicators</h3>
              </div>
              <div className="risks-list">
                {team.riskFactors.map((risk, index) => (
                  <div key={index} className="risk-item">
                    <span className="risk-icon">⚠</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Information */}
          {team.contact && (
            <section className="drawer-section">
              <div className="section-header">
                <p className="eyebrow">CONTACT</p>
                <h3>Lead Contact</h3>
              </div>
              <div className="contact-info">
                <div className="contact-item">
                  <span>Name</span>
                  <strong>{team.contact.name}</strong>
                </div>
                <div className="contact-item">
                  <span>Role</span>
                  <strong>{team.contact.role}</strong>
                </div>
                {team.contact.email && (
                  <div className="contact-item">
                    <span>Email</span>
                    <a href={`mailto:${team.contact.email}`} className="contact-email">
                      {team.contact.email}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Original Deal Context (for compatibility) */}
          {team.originalDeal && (
            <section className="drawer-section drawer-section--compatibility">
              <div className="section-header">
                <p className="eyebrow">ORIGINAL CONTEXT</p>
                <h3>Deal Information</h3>
              </div>
              <div className="deal-context">
                <p>{team.originalDeal.notes}</p>
                {team.originalDeal.insights && (
                  <div className="insights-preview">
                    {team.originalDeal.insights.map((insight, index) => (
                      <div key={index} className={`insight-preview-item insight-preview-item--${insight.tone}`}>
                        <span>{insight.title}</span>
                        <p>{insight.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="drawer-footer">
          <button className="drawer-action drawer-action--primary" type="button">
            Shortlist Team
          </button>
          <button className="drawer-action drawer-action--secondary" type="button">
            Add to Comparison
          </button>
          <button className="drawer-action drawer-action--secondary" type="button">
            Request Review
          </button>
        </div>
      </div>
    </div>
  );
}
