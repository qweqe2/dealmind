export default function LoadingState({ message = "Loading...", type = "default" }) {
  if (type === "skeleton") {
    return (
      <div className="loading-skeleton" role="status" aria-label="Loading">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  if (type === "inline") {
    return (
      <div className="loading-inline" role="status" aria-label="Loading">
        <span className="loading-spinner" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="loading-state" role="status" aria-label="Loading">
      <div className="loading-spinner" />
      <span>{message}</span>
    </div>
  );
}