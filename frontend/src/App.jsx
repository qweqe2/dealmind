import { useEffect, useState } from "react";
import { healthCheck, getDeals, chatWithAgent } from "./services/api";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState("");

  // Agent chat state
  const [selectedDealId, setSelectedDealId] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [agentResponse, setAgentResponse] = useState(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    healthCheck()
      .then((data) => setStatus(`Backend: ${data.status}`))
      .catch(() => setStatus("Backend connection failed"));

    getDeals()
      .then((data) => setDeals(data))
      .catch(() => setError("Failed to load deals"));
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) {
      setChatError("Please enter a message");
      return;
    }

    setIsChatting(true);
    setChatError("");
    setAgentResponse(null);

    try {
      const response = await chatWithAgent(selectedDealId, userMessage);
      setAgentResponse(response);
    } catch (err) {
      setChatError("Failed to get response from agent");
    } finally {
      setIsChatting(false);
    }
  };

  const isNoCreditsMessage = (answer) => {
    return answer && answer.toLowerCase().includes("no credits");
  };

  return (
    <div>
      <h1>DealMind</h1>
      <p>{status}</p>

      <h2>Deals</h2>

      {error && <p className="error-message">{error}</p>}

      {deals.length === 0 ? (
        <p>No deals found.</p>
      ) : (
        deals.map((deal) => (
          <div key={deal.id}>
            <h3>{deal.company}</h3>
            <p>Deal: {deal.deal_name}</p>
            <p>Stage: {deal.stage}</p>
            <p>Status: {deal.status}</p>
          </div>
        ))
      )}

      <h2>AI Agent Chat</h2>

      <form className="chat-form" onSubmit={handleChatSubmit}>
        <div>
          <label htmlFor="deal-select">Select Deal (Optional):</label>
          <select
            id="deal-select"
            value={selectedDealId}
            onChange={(e) => setSelectedDealId(e.target.value)}
          >
            <option value="">-- Select a deal (optional) --</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.company} - {deal.deal_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message-input">Your Question:</label>
          <textarea
            id="message-input"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            rows={4}
            placeholder="Ask about deals or general questions..."
          />
        </div>

        <button type="submit" disabled={isChatting}>
          {isChatting ? "Thinking..." : "Ask Agent"}
        </button>
      </form>

      {chatError && <p className="error-message">{chatError}</p>}

      {agentResponse && (
        <div className="agent-response">
          <h3>Agent Response</h3>
          {isNoCreditsMessage(agentResponse.answer) ? (
            <p className="error-message">{agentResponse.answer}</p>
          ) : (
            <p>{agentResponse.answer}</p>
          )}

          {agentResponse.memories && agentResponse.memories.length > 0 && (
            <div>
              <h4>Relevant Memories</h4>
              <ul>
                {agentResponse.memories.map((memory, index) => (
                  <li key={index}>{memory.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;