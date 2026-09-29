import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { askAssistant, loadDealWorkspace } from "../services/dealData";
import AIMessage from "../components/AIMessage";
import SuggestedPrompt from "../components/SuggestedPrompt";
import ThinkingIndicator from "../components/ThinkingIndicator";
import MemoryContext from "../components/MemoryContext";

const suggestions = [
  "Which teams need attention?",
  "Why is this team at risk?",
  "What changed recently?",
  "Which teams should I follow up on?",
  "Summarize this team.",
  "Compare this team to others",
  "What are the key strengths?",
  "What are the risk factors?",
];

export default function TeamAssistantPage() {
  const { teamId } = useParams();
  const [dealState, setDealState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    loadDealWorkspace(teamId)
      .then((workspace) => { if (active) setDealState({ teamId, workspace }); })
      .catch((loadError) => { if (active) setDealState({ teamId, error: loadError.message }); });
    return () => { active = false; };
  }, [teamId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function handleSend(value = draft) {
    const question = value.trim();
    if (!question || !dealState?.workspace?.deal || sending) return;
    setDraft("");
    setError("");
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: "user", content: question }]);
    setSending(true);
    try {
      const response = await askAssistant(dealState.workspace.deal, question, dealState.workspace.memories);
      setMessages((current) => [...current, {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: response.answer,
        memories: response.memories || [],
        source: response.source,
      }]);
    } catch (sendError) {
      setError(sendError.message || "The assistant could not answer. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (!dealState || dealState.teamId !== teamId) return <div className="detail-loading" role="status">Loading team assistant...</div>;
  const { workspace } = dealState;
  const deal = workspace?.deal;
  if (!deal) return <div className="detail-unavailable" role="alert"><h1>Team unavailable</h1><p>{dealState.error || "This team could not be loaded."}</p><Link to="/teams">Back to Teams</Link></div>;

  const hasMemoryContext = workspace.memories && workspace.memories.length > 0;

  return (
    <div className="assistant-page">
      <div className="detail-back">
        <Link to={`/teams/${deal.id}`}><span aria-hidden="true">←</span> Back to team</Link>
        <span className="assistant-context">
          <span className="assistant-context-dot" /> ANALYZING {deal.company?.toUpperCase()}
        </span>
      </div>
      
      <header className="assistant-heading">
        <div className="assistant-symbol" aria-hidden="true">✳</div>
        <div>
          <p className="eyebrow">TEAM INTELLIGENCE</p>
          <h1>Ask DealMind about your teams.</h1>
          <p className="page-subtitle">Get AI-powered insights, surface context, and prepare for team conversations.</p>
        </div>
      </header>

      <section className="assistant-workspace" aria-label={`Team Assistant for ${deal.company}`}>
        <header className="assistant-deal-bar">
          <div>
            <span className="assistant-deal-name">{deal.deal_name}</span>
            <span className="assistant-company-name">{deal.company} <span aria-hidden="true">·</span> {deal.stage}</span>
          </div>
          <div className="assistant-context-indicators">
            {hasMemoryContext && <span className="memory-indicator">Memory context available</span>}
            <Link to={`/teams/${deal.id}`}>View team <span aria-hidden="true">↗</span></Link>
          </div>
        </header>
        
        <div className="chat-scroll">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <span className="assistant-orbit" aria-hidden="true">✳</span>
              <h2>Ask DealMind about your teams</h2>
              <p>I'm analyzing {deal.company} and its team context to help you make informed decisions.</p>
              <div className="suggestion-list">
                {suggestions.map((suggestion) => (
                  <SuggestedPrompt 
                    key={suggestion} 
                    prompt={suggestion} 
                    onClick={handleSend} 
                    disabled={sending}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message) => (
                <AIMessage 
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  memories={message.memories}
                  source={message.source}
                />
              ))}
              {sending && (
                <div className="ai-message ai-message--assistant">
                  <div className="ai-message-avatar ai-message-avatar--assistant" aria-hidden="true">✳</div>
                  <div className="ai-message-body">
                    <div className="ai-message-meta">
                      <strong>DealMind</strong>
                    </div>
                    <div className="ai-message-content">
                      <ThinkingIndicator message="Analyzing team intelligence and memory..." />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
        
        {error && <div className="chat-error" role="alert">{error}</div>}
        
        <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
          <label className="visually-hidden" htmlFor="assistant-message">Ask DealMind</label>
          <textarea 
            id="assistant-message" 
            value={draft} 
            onChange={(event) => setDraft(event.target.value)} 
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } }} 
            placeholder={`Ask about ${deal.company}...`} 
            rows="1" 
            disabled={sending}
          />
          <button 
            className="send-button" 
            type="submit" 
            aria-label="Send message" 
            disabled={!draft.trim() || sending}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <span className="composer-hint">Enter to send <span>·</span> Shift + Enter for a new line</span>
        </form>
      </section>
      
      <p className="assistant-disclaimer">AI responses can be incomplete. Verify team decisions against the source record.</p>
    </div>
  );
}
