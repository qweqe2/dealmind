function statusLabel(status = "unknown") {
  return status.replaceAll("_", " ");
}

export default function StatusBadge({ status, size = "default" }) {
  const statusClass = status ? `status-badge--${status}` : "status-badge--default";
  const sizeClass = size === "small" ? "status-badge--small" : "";
  
  return (
    <span className={`status-badge ${statusClass} ${sizeClass}`}>
      <span className="status-badge-dot" />
      {statusLabel(status)}
    </span>
  );
}