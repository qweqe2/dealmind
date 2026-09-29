export default function DealSignal({ signal, tone = "watch" }) {
  if (!signal) return null;
  
  return (
    <div className={`deal-signal deal-signal--${tone}`}>
      <span className="deal-signal-title">{signal.title}</span>
      <p className="deal-signal-detail">{signal.detail}</p>
    </div>
  );
}
