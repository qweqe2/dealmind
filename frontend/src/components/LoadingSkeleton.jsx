/**
 * LoadingSkeleton Component
 * Loading skeleton for team cards and lists
 */

export default function LoadingSkeleton({ type = "card", count = 3 }) {
  if (type === "card") {
    return (
      <div className="loading-skeleton">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-avatar" />
              <div className="skeleton-title">
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line skeleton-line--subtitle" />
              </div>
              <div className="skeleton-score" />
            </div>
            <div className="skeleton-body">
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="loading-skeleton">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-list-item">
            <div className="skeleton-list-avatar" />
            <div className="skeleton-list-content">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--subtitle" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="loading-skeleton">
      <div className="skeleton-block" />
    </div>
  );
}
