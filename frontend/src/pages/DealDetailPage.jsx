import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { generateMeetingBrief, loadDealWorkspace } from "../services/dealData";

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
  if (state === "loading") return <section className="brief-panel" aria-live="polite"><div className="brief-loading"><span className="loading-pulse" />Building your meeting brief...</div></section>;
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

export default function DealDetailPage() {
  const { dealId } = useParams();
  const [loadState, setLoadState] = useState(null);
  const [briefState, setBriefState] = useState("idle");
  const [brief, setBrief] = useState(null);
  const [briefSource, setBriefSource] = useState("demo");
  const [briefError, setBriefError] = useState("");
  const [briefMemories, setBriefMemories] = useState([]);

  useEffect(() => {
    let active = true;
    loadDealWorkspace(dealId)
      .then((workspace) => { if (active) setLoadState({ dealId, workspace }); })
      .catch((error) => { if (active) setLoadState({ dealId, error: error.message }); });
    return () => { active = false; };
  }, [dealId]);

  async function handlePrepareMeeting() {
    if (!workspace?.deal) return;
    setBriefState("loading");
    setBriefError("");
    try {
      const result = await generateMeetingBrief(workspace.deal, workspace.timeline);
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

  if (!loadState || loadState.dealId !== dealId) return <div className="detail-loading" role="status">Loading deal context...</div>;
  if (!loadState.workspace) {
    return <div className="detail-unavailable" role="alert"><h1>Deal unavailable</h1><p>{loadState.error || "This deal could not be loaded."}</p><Link to="/deals">Back to Deals</Link></div>;
  }

  const { workspace } = loadState;
  const { deal, timeline, memories, source } = workspace;
  return (
    <>
      <div className="detail-back"><Link to="/deals"><span aria-hidden="true">←</span> All deals</Link>{source === "demo" && <span className="data-source data-source--demo">SAMPLE RECORD</span>}</div>
      <section className="detail-heading">
        <div className="detail-company-mark" aria-hidden="true">{deal.company?.slice(0, 1) || "D"}</div>
        <div className="detail-title"><p className="eyebrow">{deal.company || "Company not provided"}</p><h1>{deal.deal_name || "Untitled deal"}</h1><div className="detail-title-meta"><span className="stage-pill">{deal.stage || "Stage not set"}</span><span className={`status-pill status-pill--${deal.status || "unknown"}`}><span className="status-dot" />{(deal.status || "unknown").replaceAll("_", " ")}</span></div></div>
        <div className="detail-actions"><Link className="secondary-button" to={`/deals/${deal.id}/assistant`}><span aria-hidden="true">✳</span> Ask Deal Assistant</Link><button className="primary-button" type="button" onClick={handlePrepareMeeting} disabled={briefState === "loading"}><span aria-hidden="true">▣</span> {briefState === "loading" ? "Preparing..." : "Prepare Meeting"}</button></div>
      </section>

      {source === "demo" && <div className="demo-banner">SAMPLE DEAL CONTEXT <span>Some details below are illustrative until the backend returns complete deal records.</span></div>}

      <section className="detail-metrics" aria-label="Deal summary"><article><span>Deal value</span><strong>{currencyLabel(deal.value, deal.currency)}</strong></article><article><span>Target close</span><strong>{dateLabel(deal.close_date)}</strong></article><article><span>Next meeting</span><strong>{dateLabel(deal.next_meeting, { dateStyle: "medium", timeStyle: "short" })}</strong></article><article><span>Deal owner</span><strong>{deal.owner || "Not assigned"}</strong></article></section>

      <BriefSection state={briefState} brief={brief} source={briefSource} error={briefError} memories={briefMemories} />

      <div className="detail-grid">
        <div className="detail-main-column">
          <section className="detail-section"><div className="section-heading"><div><p className="eyebrow">DEAL PROGRESS</p><h2>Timeline</h2></div><span className="section-count">{timeline.length} activities</span></div>
            {timeline.length ? <ol className="deal-timeline">{[...timeline].sort((a, b) => new Date(b.date) - new Date(a.date)).map((event) => <li className="timeline-event" key={event.id}><span className={`timeline-marker timeline-marker--${event.type || "activity"}`} /><div className="timeline-content"><div className="timeline-event-heading"><h3>{event.title}</h3><time dateTime={event.date}>{dateLabel(event.date)}</time></div><p>{event.description || event.type || "Deal activity"}</p></div></li>)}</ol> : <p className="section-empty">No activities recorded yet.</p>}
          </section>
          <section className="detail-section notes-section"><div className="section-heading"><div><p className="eyebrow">CUSTOMER CONTEXT</p><h2>Notes</h2></div></div><p className="deal-notes">{deal.notes || "No notes have been added to this deal."}</p><div className="last-activity">Last activity <strong>{dateLabel(deal.last_activity)}</strong></div></section>
        </div>
        <aside className="detail-side-column">
          <section className="side-panel"><p className="eyebrow">CUSTOMER</p><h2>{deal.contact?.name || "Contact not provided"}</h2><p className="contact-role">{deal.contact?.role || "Role not provided"}</p>{deal.contact?.email && <a className="contact-email" href={`mailto:${deal.contact.email}`}>{deal.contact.email}</a>}<div className="side-divider" /><div className="side-meta"><span>Company</span><strong>{deal.company || "Not provided"}</strong></div><div className="side-meta"><span>Close date</span><strong>{dateLabel(deal.close_date)}</strong></div></section>
          <section className="side-panel"><div className="side-panel-heading"><div><p className="eyebrow">DEAL INTELLIGENCE</p><h2>AI insights</h2></div><span className="insight-spark" aria-hidden="true">✳</span></div>{deal.insights?.length ? <div className="insight-list">{deal.insights.map((insight) => <article className={`insight-item insight-item--${insight.tone || "watch"}`} key={insight.title}><span>{insight.title}</span><p>{insight.detail}</p></article>)}</div> : <p className="section-empty">No insights available for this deal.</p>}<Link className="insight-assistant-link" to={`/deals/${deal.id}/assistant`}>Explore with Deal Assistant <span aria-hidden="true">→</span></Link></section>
          <section className="side-panel memory-panel"><div className="side-panel-heading"><div><p className="eyebrow">RECORDED CONTEXT</p><h2>Deal memory</h2></div><span className="memory-count">{memories.length}</span></div>{memories.length ? <ul className="memory-list">{memories.slice(0, 3).map((memory) => <li key={memory.id || memory.content}><p>{memory.content}</p><span>{memory.source || "Deal note"}</span></li>)}</ul> : <p className="section-empty">No memory notes yet.</p>}</section>
        </aside>
      </div>
    </>
  );
}