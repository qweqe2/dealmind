import { useState } from "react";

export default function MemoryContext({ memories, count }) {
  const [expanded, setExpanded] = useState(false);
  const displayCount = count || memories?.length || 0;
  
  if (displayCount === 0) return null;
  
  return (
    <div className="memory-context">
      <button 
        className="memory-context-trigger"
        onClick={() => setExpanded(!expanded)}
        type="button"
        aria-expanded={expanded}
      >
        <span className="memory-context-icon" aria-hidden="true">🧠</span>
        <span className="memory-context-label">
          {displayCount} relevant memor{displayCount !== 1 ? "ies" : "y"}
        </span>
        <span className={`memory-context-chevron ${expanded ? "memory-context-chevron--expanded" : ""}`} aria-hidden="true">
          ▼
        </span>
      </button>
      
      {expanded && (
        <div className="memory-context-content">
          <p className="memory-context-intro">Based on previous interactions:</p>
          <ul className="memory-context-list">
            {memories.map((memory, index) => (
              <li key={memory.id || index} className="memory-context-item">
                <p className="memory-context-text">{memory.content}</p>
                {memory.source && (
                  <span className="memory-context-source">{memory.source}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
