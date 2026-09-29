export default function StatCard({ label, value, note, accent = "mint", loading = false }) {
  const accentClass = accent === "coral" ? "stat-card-accent--coral" : "stat-card-accent--mint";
  
  return (
    <article className="stat-card">
      <span className="stat-card-label">{label}</span>
      <strong className="stat-card-value">{loading ? "…" : value}</strong>
      {note && <span className="stat-card-note">{note}</span>}
      <span className={`stat-card-accent ${accentClass}`} />
    </article>
  );
}
