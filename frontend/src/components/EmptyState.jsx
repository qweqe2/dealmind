export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  actionLabel,
  onAction 
}) {
  return (
    <div className="empty-state" role="status">
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <button 
          className="empty-state-action" 
          type="button"
          onClick={onAction}
        >
          {actionLabel || "Take action"}
        </button>
      )}
    </div>
  );
}