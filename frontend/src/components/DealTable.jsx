import { Link } from "react-router-dom";

function statusLabel(status = "unknown") {
  return status.replaceAll("_", " ");
}

export default function DealTable({ deals, loading, error, compact = false }) {
  if (loading) {
    return <div className="table-message" role="status">Loading deals...</div>;
  }

  if (error) {
    return (
      <div className="table-message table-message--error" role="alert">
        <strong>Deals are unavailable</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (deals.length === 0) {
    return <div className="table-message">No deals have been added yet.</div>;
  }

  const visibleDeals = compact ? deals.slice(0, 5) : deals;

  return (
    <div className="table-scroll">
      <table className="deal-table">
        <thead>
          <tr>
            <th scope="col">Deal</th>
            <th scope="col">Stage</th>
            <th scope="col">Status</th>
            <th scope="col">ID</th>
          </tr>
        </thead>
        <tbody>
          {visibleDeals.map((deal) => (
            <tr key={deal.id}>
              <td>
                <Link className="deal-link" to={`/deals/${deal.id}`}>
                  <span className="deal-name">{deal.deal_name || "Untitled deal"}</span>
                  <span className="company-name">{deal.company || "Company not provided"}</span>
                </Link>
              </td>
              <td>{deal.stage || "Stage not set"}</td>
              <td>
                <span className={`status-pill status-pill--${deal.status || "unknown"}`}>
                  <span className="status-dot" />
                  {statusLabel(deal.status)}
                </span>
              </td>
              <td className="deal-id">{deal.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}