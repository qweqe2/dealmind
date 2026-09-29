import MemoryContext from "./MemoryContext";

export default function AIMessage({ role, content, memories, source, timestamp, structured }) {
  const isUser = role === "user";
  
  if (structured && role === "assistant") {
    return <StructuredAIMessage content={content} memories={memories} source={source} />;
  }
  
  return (
    <article className={`ai-message ai-message--${role}`}>
      <div className={`ai-message-avatar ai-message-avatar--${role}`} aria-hidden="true">
        {isUser ? "T" : "✳"}
      </div>
      <div className="ai-message-body">
        <div className="ai-message-meta">
          <strong>{isUser ? "You" : "DealMind"}</strong>
          {timestamp && <time className="ai-message-time">{timestamp}</time>}
          {source === "demo" && (
            <span className="ai-message-source ai-message-source--demo">DEMO RESPONSE</span>
          )}
        </div>
        <div className="ai-message-content">
          {formatMessage(content)}
        </div>
        {memories && memories.length > 0 && (
          <MemoryContext memories={memories} count={memories.length} />
        )}
      </div>
    </article>
  );
}

function StructuredAIMessage({ content, memories, source }) {
  return (
    <article className="ai-message ai-message--assistant ai-message--structured">
      <div className="ai-message-avatar ai-message-avatar--assistant" aria-hidden="true">✳</div>
      <div className="ai-message-body">
        <div className="ai-message-meta">
          <strong>DealMind</strong>
          {source === "demo" && (
            <span className="ai-message-source ai-message-source--demo">DEMO RESPONSE</span>
          )}
        </div>
        
        <div className="ai-message-structured">
          {content.header && (
            <div className="ai-message-header">
              <span className="ai-message-header-icon" aria-hidden="true">✦</span>
              <h3>{content.header}</h3>
            </div>
          )}
          
          {content.summary && (
            <p className="ai-message-summary">{content.summary}</p>
          )}
          
          {content.insights && content.insights.length > 0 && (
            <div className="ai-message-insights">
              {content.insights.map((insight, index) => (
                <div key={index} className="ai-message-insight-card">
                  <div className="ai-message-insight-header">
                    <span className="ai-message-insight-deal">{insight.deal}</span>
                    <span className={`ai-message-insight-signal ai-message-insight-signal--${insight.tone || "watch"}`}>
                      {insight.signal}
                    </span>
                  </div>
                  <p className="ai-message-insight-why">{insight.why}</p>
                  <div className="ai-message-insight-action">
                    <span className="ai-message-insight-action-label">Recommended action:</span>
                    <span className="ai-message-insight-action-text">{insight.action}</span>
                  </div>
                  <div className="ai-message-insight-buttons">
                    {insight.onOpenDeal && (
                      <button className="ai-message-insight-button" type="button">
                        Open Deal
                      </button>
                    )}
                    {insight.onInvestigate && (
                      <button className="ai-message-insight-button ai-message-insight-button--secondary" type="button">
                        Investigate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {memories && memories.length > 0 && (
            <MemoryContext memories={memories} count={memories.length} />
          )}
        </div>
      </div>
    </article>
  );
}

function formatMessage(content) {
  if (!content) return null;
  
  // Simple text formatting - preserve line breaks as paragraphs
  return content.split('\n').map((line, index) => {
    if (line.trim() === '') {
      return <br key={index} />;
    }
    return <p key={index}>{line}</p>;
  });
}