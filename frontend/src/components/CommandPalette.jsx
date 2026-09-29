import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const commands = [
  { id: "dashboard", label: "Go to Selection Dashboard", shortcut: "G D", action: () => "/" },
  { id: "teams", label: "View AI Ranking", shortcut: "G T", action: () => "/teams" },
  { id: "ask", label: "Ask DealMind", shortcut: "A", action: null },
];

export default function CommandPalette({ deals = [], teams = [], isOpen, onClose }) {
  const searchItems = teams.length > 0 ? teams : deals;
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredItems = searchItems.filter(item =>
    (item.teamName || item.deal_name || "").toLowerCase().includes(query.toLowerCase()) ||
    (item.company || "").toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const allItems = [
    ...filteredCommands.map(cmd => ({ type: "command", ...cmd })),
    ...filteredItems.map(item => ({ type: "team", ...item }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = allItems[selectedIndex];
      if (selectedItem) {
        handleSelect(selectedItem);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (item) => {
    if (item.type === "command" && item.action) {
      navigate(item.action());
    } else if (item.type === "team") {
      navigate(`/teams/${item.id}`);
    }
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-input-wrapper">
          <span className="command-palette-search-icon" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            className="command-palette-input"
            type="text"
            placeholder="Search teams, commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="command-palette-hint">ESC to close</span>
        </div>
        
        <div className="command-palette-results">
          {allItems.length === 0 ? (
            <div className="command-palette-empty">No results found</div>
          ) : (
            allItems.map((item, index) => (
              <button
                key={item.id || item.type + index}
                className={`command-palette-item ${index === selectedIndex ? "command-palette-item--selected" : ""}`}
                onClick={() => handleSelect(item)}
                type="button"
              >
                {item.type === "command" ? (
                  <>
                    <span className="command-palette-item-label">{item.label}</span>
                    {item.shortcut && (
                      <span className="command-palette-item-shortcut">{item.shortcut}</span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="command-palette-item-deal-name">{item.teamName || item.deal_name}</span>
                    <span className="command-palette-item-company">{item.company}</span>
                  </>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
