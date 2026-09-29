import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { askAssistant, loadDealWorkspace } from "../services/dealData";

const suggestions = [
  "Why is this deal stuck?",
  "Summarize this deal",
  "What should I do next?",
  "What are the risks?",
  "Prepare me for the meeting",
];

export default function DealAssistantPage() {
  const { dealId } = useParams();

  const [dealState, setDealState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);

  // ---------------------------------------------------------
  // Load deal workspace
  // ---------------------------------------------------------

  useEffect(() => {
    let active = true;

    loadDealWorkspace(dealId)
      .then((workspace) => {
        if (active) {
          setDealState({
            dealId,
            workspace,
          });
        }
      })
      .catch((loadError) => {
        if (active) {
          setDealState({
            dealId,
            error: loadError.message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [dealId]);

  // ---------------------------------------------------------
  // Keep chat scrolled to bottom
  // ---------------------------------------------------------

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending]);

  // ---------------------------------------------------------
  // Send message
  // ---------------------------------------------------------

  async function handleSend(value = draft) {
    const question = value.trim();

    if (!question || !deal || sending) {
      return;
    }

    setDraft("");
    setError("");

    // Add user message immediately
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: question,
      },
    ]);

    setSending(true);

    try {
      const response = await askAssistant(
        deal,
        question,
        dealState.workspace?.memories || []
      );

      // Add assistant response
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content:
            response.answer ||
            "I couldn't generate an answer. Please try again.",
          memories: response.memories || [],
          source: response.source,
        },
      ]);
    } catch (sendError) {
      setError(
        sendError.message ||
          "The assistant could not answer. Try again."
      );
    } finally {
      setSending(false);
    }
  }

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------

  if (!dealState || dealState.dealId !== dealId) {
    return (
      <div className="detail-loading" role="status">
        Loading deal assistant...
      </div>
    );
  }

  // ---------------------------------------------------------
  // Deal unavailable
  // ---------------------------------------------------------

  const { workspace } = dealState;
  const { deal } = workspace || {};

  if (!deal) {
    return (
      <div className="detail-unavailable" role="alert">
        <h1>Deal unavailable</h1>

        <p>
          {dealState.error ||
            "This deal could not be loaded."}
        </p>

        <Link to="/deals">Back to Deals</Link>
      </div>
    );
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="assistant-page">

      {/* --------------------------------------------------- */}
      {/* Back navigation */}
      {/* --------------------------------------------------- */}

      <div className="detail-back">
        <Link to={`/deals/${deal.id}`}>
          <span aria-hidden="true">←</span>
          {" "}Back to deal
        </Link>

        <span className="assistant-context">
          <span className="assistant-context-dot" />
          {" "}ANALYZING {deal.company?.toUpperCase()}
        </span>
      </div>

      {/* --------------------------------------------------- */}
      {/* Page heading */}
      {/* --------------------------------------------------- */}

      <header className="assistant-heading">
        <div
          className="assistant-symbol"
          aria-hidden="true"
        >
          ✳
        </div>

        <div>
          <p className="eyebrow">
            DEAL ASSISTANT
          </p>

          <h1>
            Think through the next move.
          </h1>

          <p className="page-subtitle">
            Ask about the deal, surface context, or prepare
            for a customer conversation.
          </p>
        </div>
      </header>

      {/* --------------------------------------------------- */}
      {/* Assistant workspace */}
      {/* --------------------------------------------------- */}

      <section
        className="assistant-workspace"
        aria-label={`Deal Assistant for ${deal.company}`}
      >

        {/* Deal header */}
        <header className="assistant-deal-bar">
          <div>
            <span className="assistant-deal-name">
              {deal.deal_name}
            </span>

            <span className="assistant-company-name">
              {deal.company}
              {" "}
              <span aria-hidden="true">·</span>
              {" "}
              {deal.stage}
            </span>
          </div>

          <Link to={`/deals/${deal.id}`}>
            View deal
            {" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </header>

        {/* ------------------------------------------------- */}
        {/* Chat */}
        {/* ------------------------------------------------- */}

        <div className="chat-scroll">

          {/* Empty chat */}
          {messages.length === 0 ? (
            <div className="chat-welcome">

              <span
                className="assistant-orbit"
                aria-hidden="true"
              >
                ✳
              </span>

              <h2>
                What would you like to know?
              </h2>

              <p>
                I’m looking at {deal.company} and its
                deal context.
              </p>

              <div className="suggestion-list">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    disabled={sending}
                  >
                    {suggestion}

                    <span aria-hidden="true">
                      ↗
                    </span>
                  </button>
                ))}
              </div>

            </div>
          ) : (

            /* ------------------------------------------------ */
            /* Messages                                        */
            /* ------------------------------------------------ */

            <div className="message-list">

              {messages.map((message) => {

                const hasMemory =
                  message.role === "assistant" &&
                  Array.isArray(message.memories) &&
                  message.memories.length > 0;

                return (
                  <article
                    className={`chat-message chat-message--${message.role}`}
                    key={message.id}
                  >

                    {/* Avatar */}
                    <div
                      className={`message-avatar message-avatar--${message.role}`}
                      aria-hidden="true"
                    >
                      {message.role === "user"
                        ? "T"
                        : "✳"}
                    </div>

                    {/* Message body */}
                    <div className="message-body">

                      <div className="message-meta">

                        <strong>
                          {message.role === "user"
                            ? "You"
                            : "Deal Assistant"}
                        </strong>

                        {message.source === "demo" && (
                          <span className="data-source data-source--demo">
                            DEMO RESPONSE
                          </span>
                        )}

                      </div>

                      {/* Main answer */}
                      <p>
                        {message.content}
                      </p>

                      {/* ------------------------------------------------ */}
                      {/* Clean memory indicator                           */}
                      {/* ------------------------------------------------ */}

                      {hasMemory && (
                        <div className="message-sources">
                          <span>🧠 Memory used</span>
                          <span>Saved context</span>
                        </div>
                      )}

                    </div>
                  </article>
                );
              })}

              {/* ------------------------------------------------ */}
              {/* Typing indicator                                */}
              {/* ------------------------------------------------ */}

              {sending && (
                <div className="chat-message chat-message--assistant">

                  <div
                    className="message-avatar message-avatar--assistant"
                    aria-hidden="true"
                  >
                    ✳
                  </div>

                  <div className="message-body">

                    <div className="message-meta">
                      <strong>
                        Deal Assistant
                      </strong>
                    </div>

                    <div
                      className="typing-indicator"
                      role="status"
                    >
                      <span />
                      <span />
                      <span />
                      {" "}Thinking through the deal
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          <div ref={scrollRef} />

        </div>

        {/* --------------------------------------------------- */}
        {/* Error */}
        {/* --------------------------------------------------- */}

        {error && (
          <div
            className="chat-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* --------------------------------------------------- */}
        {/* Composer */}
        {/* --------------------------------------------------- */}

        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >

          <label
            className="visually-hidden"
            htmlFor="assistant-message"
          >
            Ask the Deal Assistant
          </label>

          <textarea
            id="assistant-message"
            value={draft}
            onChange={(event) =>
              setDraft(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask about ${deal.company}...`}
            rows="1"
            disabled={sending}
          />

          <button
            className="send-button"
            type="submit"
            aria-label="Send message"
            disabled={
              !draft.trim() || sending
            }
          >
            <span aria-hidden="true">
              ↑
            </span>
          </button>

          <span className="composer-hint">
            Enter to send
            {" "}
            <span>·</span>
            {" "}
            Shift + Enter for a new line
          </span>

        </form>

      </section>

      {/* ----------------------------------------------------- */}
      {/* Disclaimer */}
      {/* ----------------------------------------------------- */}

      <p className="assistant-disclaimer">
        AI responses can be incomplete. Verify deal
        decisions against the source record.
      </p>

    </div>
  );
}