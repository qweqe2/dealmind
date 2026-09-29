export default function AIRecommendation({ recommendation, source = "api" }) {
  if (!recommendation) return null;
  
  return (
    <section className="ai-recommendation">
      <div className="ai-recommendation-header">
        <span className="ai-recommendation-icon" aria-hidden="true">✦</span>
        <div>
          <p className="ai-recommendation-label">RECOMMENDED ACTION</p>
          <h3 className="ai-recommendation-title">AI suggests</h3>
        </div>
        {source === "demo" && (
          <span className="ai-recommendation-source">DEMO</span>
        )}
      </div>
      <p className="ai-recommendation-content">{recommendation}</p>
    </section>
  );
}
