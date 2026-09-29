import { useMemo, useState } from "react";
import DealTable from "../components/DealTable";

export default function DealsPage({ deals, loading, error, dataSource }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDeals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const matchesSearch = !normalizedSearch || `${deal.company || ""} ${deal.deal_name || ""} ${deal.stage || ""}`.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deals, search, statusFilter]);

  return (
    <>
      <section className="page-heading page-heading--list">
        <div>
          <p className="eyebrow">PIPELINE</p>
          <h1>Deals</h1>
          <p className="page-subtitle">Track every opportunity and its current momentum.</p>
        </div>
        <div className="page-heading-meta">
          <span className="list-total">{loading || error ? "—" : `${deals.length} deals`}</span>
          {dataSource === "demo" && (
            <span className="data-source-badge data-source-badge--demo">DEMO DATA</span>
          )}
          {dataSource === "api" && (
            <span className="data-source-badge data-source-badge--live">LIVE DATA</span>
          )}
        </div>
      </section>
      <section className="content-section deals-section">
        <div className="list-toolbar">
          <label className="search-field"><span className="search-icon" aria-hidden="true" /><span className="visually-hidden">Search deals</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, deal, or stage" /></label>
          <label className="filter-field"><span className="visually-hidden">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="needs_attention">Needs attention</option><option value="on_track">On track</option></select></label>
        </div>
        <div className="data-panel"><DealTable deals={filteredDeals} loading={loading} error={error} /></div>
      </section>
    </>
  );
}