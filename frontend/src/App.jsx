import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import DealAssistantPage from "./pages/DealAssistantPage";
import { healthCheck } from "./services/api";
import { loadDeals } from "./services/dealData";
import "./App.css";
import "./pages/deal-pages.css";
import React, { useState, useEffect } from "react";
function Workspace() {
  const [backendOnline, setBackendOnline] = useState(null);
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dataSource, setDataSource] = useState("api");
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    healthCheck({ signal: controller.signal })
      .then(() => setBackendOnline(true))
      .catch((error) => { if (error.name !== "AbortError") setBackendOnline(false); });
    loadDeals()
      .then(({ deals: result, source }) => {
        if (!controller.signal.aborted) {
          setDeals(result);
          setDataSource(source);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setDealsLoading(false); });
    return () => controller.abort();
  }, []);

  const pathname = location.pathname;
  const pageTitle = pathname.startsWith("/deals/")
    ? pathname.endsWith("/assistant") ? "Deal Assistant" : "Deal detail"
    : pathname === "/deals" ? "Deals" : "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>dealmind</span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink className={({ isActive }) => `nav-item${isActive && location.pathname === "/" ? " nav-item--active" : ""}`} end to="/">
            <span className="nav-glyph nav-glyph--dashboard" aria-hidden="true" />Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item${isActive ? " nav-item--active" : ""}`} to="/deals">
            <span className="nav-glyph nav-glyph--deals" aria-hidden="true" />Deals
            <span className="nav-count">{dealsLoading ? "—" : deals.length}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-label">SYSTEM</div>
          <div className="connection-state"><span className={`connection-dot${backendOnline === false ? " connection-dot--offline" : ""}`} /><span>{backendOnline === null ? "Connecting to API" : backendOnline ? "API connected" : "API unavailable"}</span></div>
          <div className="user-profile"><div className="avatar" aria-hidden="true">T</div><div><strong>Team workspace</strong><span>Deal intelligence</span></div><span className="profile-menu" aria-hidden="true">···</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb"><Link to="/">Workspace</Link><span className="breadcrumb-separator">/</span><strong>{pageTitle}</strong></div><div className="topbar-meta"><span className={`api-badge${backendOnline === false ? " api-badge--offline" : ""}`}><span />{backendOnline === null ? "Connecting" : backendOnline ? "Backend online" : "Backend offline"}</span></div></header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage deals={deals} loading={dealsLoading} error="" backendOnline={backendOnline} dataSource={dataSource} />} />
            <Route path="/deals" element={<DealsPage deals={deals} loading={dealsLoading} error="" dataSource={dataSource} />} />
            <Route path="/deals/:dealId" element={<DealDetailPage />} />
            <Route path="/deals/:dealId/assistant" element={<DealAssistantPage />} />
            <Route path="*" element={<div className="detail-unavailable"><h1>Page not found</h1><p>This DealMind view does not exist.</p><Link to="/">Back to Dashboard</Link></div>} />
          </Routes>
          <footer className="page-footer"><span>DEALMIND</span><span>Context for your next move.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><Workspace /></BrowserRouter>;
}