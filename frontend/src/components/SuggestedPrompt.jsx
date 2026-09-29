export default function SuggestedPrompt({ prompt, onClick, disabled = false }) {
  return (
    <button 
      className="suggested-prompt"
      onClick={() => onClick?.(prompt)}
      disabled={disabled}
      type="button"
    >
      <span className="suggested-prompt-text">{prompt}</span>
      <span className="suggested-prompt-arrow" aria-hidden="true">↗</span>
    </button>
  );
}
