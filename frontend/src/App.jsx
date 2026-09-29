import { useState, useEffect } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import TeamSelectionDashboard from "./pages/TeamSelectionDashboard";
import TeamDetailPage from "./pages/TeamDetailPage";
import TeamAssistantPage from "./pages/TeamAssistantPage";
import CommandPalette from "./components/CommandPalette";
import { healthCheck } from "./services/api";
import { loadDeals } from "./services/dealData";
import "./App.css";
import "./pages/deal-pages.css";

function Workspace() {
  const [backendOnline, setBackendOnline] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [dataSource, setDataSource] = useState("api");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    healthCheck({ signal: controller.signal })
      .then(() => setBackendOnline(true))
      .catch((error) => { if (error.name !== "AbortError") setBackendOnline(false); });
    loadDeals()
      .then(({ deals: result, source }) => {
        if (!controller.signal.aborted) {
          setTeams(result);
          setDataSource(source);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setTeamsLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pathname = location.pathname;
  const pageTitle = pathname.startsWith("/teams/")
    ? pathname.endsWith("/assistant") ? "Team Intelligence" : "Team Candidate"
    : pathname === "/teams" ? "AI Ranking" : "Selection Dashboard";

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
            <span className="nav-glyph nav-glyph--dashboard" aria-hidden="true" />Selection Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item${isActive ? " nav-item--active" : ""}`} to="/teams">
            <span className="nav-glyph nav-glyph--deals" aria-hidden="true" />AI Ranking
            <span className="nav-count">{teamsLoading ? "—" : teams.length}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-label">SYSTEM</div>
          <div className="connection-state"><span className={`connection-dot${backendOnline === false ? " connection-dot--offline" : ""}`} /><span>{backendOnline === null ? "Connecting to API" : backendOnline ? "API connected" : "API unavailable"}</span></div>
          <div className="user-profile"><div className="avatar" aria-hidden="true">T</div><div><strong>Team workspace</strong><span>AI team selection</span></div><span className="profile-menu" aria-hidden="true">···</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <Link to="/">Workspace</Link>
            <span className="breadcrumb-separator">/</span>
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-meta">
            <button 
              className="command-palette-trigger"
              onClick={() => setCommandPaletteOpen(true)}
              type="button"
              aria-label="Open command palette"
            >
              <span aria-hidden="true">⌘K</span>
            </button>
            <span className={`api-badge${backendOnline === false ? " api-badge--offline" : ""}`}>
              <span />
              {backendOnline === null ? "Connecting" : backendOnline ? "Backend online" : "Backend offline"}
            </span>
          </div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<TeamSelectionDashboard />} />
            <Route path="/teams" element={<TeamSelectionDashboard />} />
            <Route path="/teams/:teamId" element={<TeamDetailPage />} />
            <Route path="/teams/:teamId/assistant" element={<TeamAssistantPage />} />
            <Route path="*" element={<div className="detail-unavailable"><h1>Page not found</h1><p>This DealMind view does not exist.</p><Link to="/">Back to Dashboard</Link></div>} />
          </Routes>
          <footer className="page-footer"><span>DEALMIND</span><span>AI analyzes 30,000 teams to identify the 60 strongest candidates</span></footer>
        </div>
      </main>
      
      <CommandPalette 
        deals={[]}
        teams={teams}
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><Workspace /></BrowserRouter>;
}