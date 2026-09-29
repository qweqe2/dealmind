export default function ThinkingIndicator({ message = "Thinking..." }) {
  return (
    <div className="thinking-indicator" role="status" aria-live="polite">
      <div className="thinking-indicator-dots">
        <span />
        <span />
        <span />
      </div>
      <span className="thinking-indicator-text">{message}</span>
    </div>
  );
}
