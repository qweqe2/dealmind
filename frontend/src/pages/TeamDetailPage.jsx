import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { generateMeetingBrief, loadDealWorkspace } from "../services/dealData";
import StatusBadge from "../components/StatusBadge";
import DealSignal from "../components/DealSignal";
import AIRecommendation from "../components/AIRecommendation";
import MemoryContext from "../components/MemoryContext";
import DealRiskCard from "../components/DealRiskCard";

function dateLabel(value, options = { dateStyle: "medium" }) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", options).format(date);
}

function currencyLabel(value, currency = "USD") {
  if (value == null || Number.isNaN(Number(value))) return "Not provided";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function BriefSection({ state, brief, source, error, memories }) {
  if (state === "idle") return null;
  if (state === "loading") return <section className="brief-panel" aria-live="polite"><div className="brief-loading"><span className="loading-spinner" />Building your meeting brief...</div></section>;
  if (state === "error") return <section className="brief-panel brief-panel--error" role="alert"><h2>Brief could not be prepared</h2><p>{error}</p></section>;
  if (!brief || !Object.values(brief).some((value) => Array.isArray(value) ? value.length : Boolean(value))) {
    return <section className="brief-panel"><h2>Meeting brief is empty</h2><p>No brief details were returned. Add deal context or try again.</p></section>;
  }

  const lists = [
    ["Stakeholders", brief.stakeholders],
    ["Customer needs", brief.interests],
    ["Previous interactions", brief.previous_interactions],
    ["Risks & blockers", brief.objections],
    ["Open issues", brief.unresolved_issues],
    ["Suggested talking points", brief.suggested_talking_points],
    ["Recommended next steps", brief.next_steps || brief.commitments],
    ["Alternatives considered", brief.competitors],
  ];

  return (
    <section className="brief-panel" id="meeting-brief" aria-labelledby="brief-title">
      <div className="brief-header"><div><p className="eyebrow">MEETING PREPAREDNESS</p><h2 id="brief-title">Meeting brief</h2></div><span className={`data-source${source === "demo" ? " data-source--demo" : ""}`}>{source === "demo" ? "DEMO BRIEF" : "AI GENERATED"}</span></div>
      {brief.summary && <p className="brief-summary">{brief.summary}</p>}
      <div className="brief-focus"><span>Current deal status</span><strong>{brief.deal_stage || "Not provided"}</strong>{brief.suggested_focus && <><span>Suggested focus</span><strong>{brief.suggested_focus}</strong></>}</div>
      <div className="brief-grid">{lists.map(([title, values]) => values?.length > 0 && <div className="brief-list" key={title}><h3>{title}</h3><ul>{values.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul></div>)}</div>
      {memories?.length > 0 && <div className="brief-memory"><span>Deal memory used</span><strong>{memories.length} context notes</strong></div>}
      {source === "demo" && <p className="demo-disclaimer">Preview created from sample deal context because the meeting-brief endpoint is unavailable.</p>}
    </section>
  );
}

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const [loadState, setLoadState] = useState(null);
  const [briefState, setBriefState] = useState("idle");
  const [brief, setBrief] = useState(null);
  const [briefSource, setBriefSource] = useState("demo");
  const [briefError, setBriefError] = useState("");
  const [briefMemories, setBriefMemories] = useState([]);

  useEffect(() => {
    let active = true;
    loadDealWorkspace(teamId)
      .then((workspace) => { if (active) setLoadState({ teamId, workspace }); })
      .catch((error) => { if (active) setLoadState({ teamId, error: error.message }); });
    return () => { active = false; };
  }, [teamId]);

  async function handlePrepareMeeting() {
    if (!loadState?.workspace?.deal) return;
    setBriefState("loading");
    setBriefError("");
    try {
      const result = await generateMeetingBrief(loadState.workspace.deal, loadState.workspace.timeline);
      setBrief(result.brief);
      setBriefSource(result.source);
      setBriefMemories(result.memories || []);
      setBriefState("ready");
      requestAnimationFrame(() => document.getElementById("meeting-brief")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) {
      setBriefError(error.message || "Unable to prepare the meeting brief.");
      setBriefState("error");
    }
  }

  if (!loadState || loadState.teamId !== teamId) return <div className="detail-loading" role="status">Loading team context...</div>;
  if (!loadState.workspace) {
    return <div className="detail-unavailable" role="alert"><h1>Team unavailable</h1><p>{loadState.error || "This team could not be loaded."}</p><Link to="/teams">Back to Teams</Link></div>;
  }

  const { workspace } = loadState;
  const { deal, timeline, memories, source } = workspace;
  const hasMemoryContext = memories && memories.length > 0;
  
  // Generate AI recommendation from insights
  const primaryRisk = deal.insights?.find(insight => insight.tone === "risk");
  const aiRecommendation = primaryRisk 
    ? `Address the ${primaryRisk.title.toLowerCase()}: ${primaryRisk.detail}. Consider scheduling a follow-up with ${deal.contact?.name || "the contact"} to resolve this blocker.`
    : deal.insights?.[0]?.detail || "Continue monitoring team progress and maintain regular communication.";
  
  // Check if this team has derived metrics
  const hasDerivedMetrics = source === 'demo';

  return (
    <>
      <div className="detail-back"><Link to="/teams"><span aria-hidden="true">←</span> All teams</Link>{source === "demo" && <span className="data-source data-source--demo">SAMPLE RECORD</span>}</div>
      
      {/* Team Header */}
      <section className="deal-detail-header">
        <div className="deal-detail-company-mark" aria-hidden="true">{deal.company?.slice(0, 1) || "D"}</div>
        <div className="deal-detail-title">
          <p className="eyebrow">{deal.company || "Company not provided"}</p>
          <h1>{deal.deal_name || "Untitled team"}</h1>
          <div className="deal-detail-meta">
            <span className="stage-pill">{deal.stage || "Stage not set"}</span>
            <StatusBadge status={deal.status} />
            <span className="deal-detail-value">{currencyLabel(deal.value, deal.currency)}</span>
          </div>
        </div>
        <div className="deal-detail-actions">
          <Link className="secondary-button" to={`/teams/${deal.id}/assistant`}><span aria-hidden="true">✳</span> Ask DealMind</Link>
          <button className="primary-button" type="button" onClick={handlePrepareMeeting} disabled={briefState === "loading"}><span aria-hidden="true">▣</span> {briefState === "loading" ? "Preparing..." : "Prepare Meeting"}</button>
        </div>
      </section>

      {source === "demo" && <div className="demo-banner">SAMPLE TEAM CONTEXT <span>Some details below are illustrative until the backend returns complete team records.</span></div>}

      {/* AI Team Brief */}
      <section className="deal-detail-brief">
        <div className="deal-detail-brief-header">
          <span className="deal-detail-brief-icon" aria-hidden="true">✳</span>
          <div>
            <p className="eyebrow">AI TEAM BRIEF</p>
            <h2>Why this team needs attention</h2>
          </div>
          {hasMemoryContext && <span className="memory-indicator">Memory context available</span>}
          {hasDerivedMetrics && <span className="data-source data-source--demo">Demo data</span>}
        </div>
        
        <div className="deal-detail-brief-content">
          {deal.status === "needs_attention" && (
            <div className="deal-detail-brief-alert">
              <span className="deal-detail-brief-alert-icon">⚠</span>
              <div>
                <h3>This team requires attention</h3>
                <p>AI analysis has identified risk signals that may impact team progression.</p>
              </div>
            </div>
          )}
          
          {deal.notes && (
            <div className="deal-detail-brief-notes">
              <span className="deal-detail-brief-label">Key context</span>
              <p>{deal.notes}</p>
            </div>
          )}
          
          {deal.insights && deal.insights.length > 0 && (
            <div className="deal-detail-brief-insights">
              <span className="deal-detail-brief-label">AI analysis</span>
              <div className="deal-detail-brief-insights-list">
                {deal.insights.map((insight) => (
                  <DealSignal key={insight.title} signal={insight} tone={insight.tone} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Risk Signals */}
      {deal.insights && deal.insights.length > 0 && (
        <section className="deal-detail-risks">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RISK SIGNALS</p>
              <h2>Signals detected</h2>
            </div>
          </div>
          <div className="deal-detail-risks-list">
            {deal.insights.map((insight) => (
              <div key={insight.title} className={`deal-detail-risk-item deal-detail-risk-item--${insight.tone || "watch"}`}>
                <span className="deal-detail-risk-title">{insight.title}</span>
                <p className="deal-detail-risk-detail">{insight.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Action */}
      <AIRecommendation 
        recommendation={aiRecommendation}
        source={source}
      />

      {/* Split Layout: Timeline and Memory */}
      <div className="deal-detail-split">
        <div className="deal-detail-main">
          <section className="detail-section">
            <div className="section-heading">
              <div><p className="eyebrow">TIMELINE</p><h2>Activity history</h2></div>
              <span className="section-count">{timeline.length} activities</span>
            </div>
            {timeline.length ? (
              <ol className="deal-timeline">
                {[...timeline].sort((a, b) => new Date(b.date) - new Date(a.date)).map((event) => (
                  <li className="timeline-event" key={event.id}>
                    <span className={`timeline-marker timeline-marker--${event.type || "activity"}`} />
                    <div className="timeline-content">
                      <div className="timeline-event-heading">
                        <h3>{event.title}</h3>
                        <time dateTime={event.date}>{dateLabel(event.date)}</time>
                      </div>
                      <p>{event.description || event.type || "Team activity"}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="section-empty">No activities recorded yet.</p>}
          </section>
        </div>
        
        <aside className="deal-detail-side">
          <section className="side-panel">
            <div className="side-panel-heading">
              <div><p className="eyebrow">MEMORY / CONTEXT</p><h2>Relevant memory</h2></div>
              {hasMemoryContext && <span className="memory-count">{memories.length}</span>}
            </div>
            {hasMemoryContext ? (
              <MemoryContext memories={memories} count={memories.length} />
            ) : (
              <p className="section-empty">No memory context available yet.</p>
            )}
          </section>
          
          <section className="side-panel">
            <p className="eyebrow">CONTACT</p>
            <h2>{deal.contact?.name || "Contact not provided"}</h2>
            <p className="contact-role">{deal.contact?.role || "Role not provided"}</p>
            {deal.contact?.email && <a className="contact-email" href={`mailto:${deal.contact.email}`}>{deal.contact.email}</a>}
            <div className="side-divider" />
            <div className="side-meta"><span>Company</span><strong>{deal.company || "Not provided"}</strong></div>
            <div className="side-meta"><span>Close date</span><strong>{dateLabel(deal.close_date)}</strong></div>
          </section>
        </aside>
      </div>

      {/* Meeting Brief (Collapsible) */}
      <BriefSection state={briefState} brief={brief} source={briefSource} error={briefError} memories={briefMemories} />
    </>
  );
}
