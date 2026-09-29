import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function currencyLabel(value, currency = "USD") {
  if (value == null || Number.isNaN(Number(value))) return "Not provided";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function dateLabel(value, options = { dateStyle: "medium" }) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", options).format(date);
}

export default function DealRiskCard({ deal, onInvestigate, onOpen }) {
  const riskLevel = deal.status === "needs_attention" ? "high" : "low";
  const primarySignal = deal.insights?.find(insight => insight.tone === "risk") || deal.insights?.[0];
  
  return (
    <article className={`deal-risk-card deal-risk-card--${riskLevel}`}>
      <div className="deal-risk-card-header">
        <div className="deal-risk-card-company">
          <span className="deal-risk-card-company-mark" aria-hidden="true">
            {deal.company?.slice(0, 1) || "D"}
          </span>
          <div>
            <span className="deal-risk-card-company-name">{deal.company || "Company not provided"}</span>
            <span className="deal-risk-card-deal-name">{deal.deal_name || "Untitled deal"}</span>
          </div>
        </div>
        <div className="deal-risk-card-meta">
          <span className="deal-risk-card-value">{currencyLabel(deal.value, deal.currency)}</span>
          <span className="deal-risk-card-stage">{deal.stage || "Stage not set"}</span>
          <StatusBadge status={deal.status} size="small" />
        </div>
      </div>
      
      <div className="deal-risk-card-signal">
        <span className="deal-risk-card-signal-label">Signal</span>
        {primarySignal ? (
          <div className={`deal-risk-card-signal-content deal-risk-card-signal-content--${primarySignal.tone || "watch"}`}>
            <span>{primarySignal.title}</span>
            <p>{primarySignal.detail}</p>
          </div>
        ) : (
          <span className="deal-risk-card-signal-empty">No signals detected</span>
        )}
      </div>
      
      <div className="deal-risk-card-footer">
        <div className="deal-risk-card-activity">
          <span className="deal-risk-card-activity-label">Last activity</span>
          <span className="deal-risk-card-activity-value">{dateLabel(deal.last_activity)}</span>
        </div>
        <div className="deal-risk-card-actions">
          <button 
            className="deal-risk-card-action deal-risk-card-action--investigate"
            onClick={() => onInvestigate?.(deal)}
            type="button"
          >
            Investigate
          </button>
          <Link 
            className="deal-risk-card-action deal-risk-card-action--open"
            to={`/deals/${deal.id}`}
            onClick={() => onOpen?.(deal)}
          >
            Open deal
          </Link>
        </div>
      </div>
    </article>
  );
}
