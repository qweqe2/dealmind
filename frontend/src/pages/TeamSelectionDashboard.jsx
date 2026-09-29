/**
 * TeamSelectionDashboard Component
 * Main AI Selection Dashboard showing funnel, metrics, and ranked teams
 */

import { useState, useEffect, useMemo } from 'react';
import { loadDeals } from '../services/dealData';
import { 
  generateTeamSelectionData, 
  calculateFunnelMetrics, 
  filterTeams, 
  paginateTeams,
  getFilterOptions 
} from '../services/teamDataAdapter';
import StatCard from '../components/StatCard';
import SelectionFunnel from '../components/SelectionFunnel';
import TeamRankingCard from '../components/TeamRankingCard';
import TeamSearch from '../components/TeamSearch';
import TeamComparison from '../components/TeamComparison';
import TeamDetailDrawer from '../components/TeamDetailDrawer';
import Pagination from '../components/Pagination';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function TeamSelectionDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('demo');
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    search: '',
    stage: 'all',
    industry: 'all',
    location: 'all',
    minScore: undefined,
    maxScore: undefined,
    sortBy: 'aiScore',
    sortDirection: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Multi-select and comparison state
  const [selectedTeamIds, setSelectedTeamIds] = useState(new Set());
  const [showComparison, setShowComparison] = useState(false);
  
  // Team detail drawer state
  const [detailTeam, setDetailTeam] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Load and transform data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { deals, source } = await loadDeals();
        const teamData = generateTeamSelectionData(deals, source);
        setTeams(teamData);
        setDataSource(source);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateFunnelMetrics(teams);
  }, [teams]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    return filterTeams(teams, filters);
  }, [teams, filters]);

  // Paginate teams
  const { teams: paginatedTeams, totalPages } = useMemo(() => {
    return paginateTeams(filteredTeams, currentPage, pageSize);
  }, [filteredTeams, currentPage, pageSize]);

  // Get filter options
  const filterOptions = useMemo(() => {
    return getFilterOptions(teams);
  }, [teams]);

  // Get selected teams for comparison
  const selectedTeams = useMemo(() => {
    return teams.filter(team => selectedTeamIds.has(team.id));
  }, [teams, selectedTeamIds]);

  const handleSearch = (search, newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page, newSize) => {
    if (newSize) {
      setPageSize(newSize);
    }
    setCurrentPage(page);
  };

  const handleTeamSelect = (teamId) => {
    const newSelected = new Set(selectedTeamIds);
    if (newSelected.has(teamId)) {
      newSelected.delete(teamId);
    } else {
      newSelected.add(teamId);
    }
    setSelectedTeamIds(newSelected);
  };

  const handleViewDetails = (team) => {
    setDetailTeam(team);
    setShowDetailDrawer(true);
  };

  const handleBulkAction = (action) => {
    // Implement bulk actions: shortlist, reject, move to review
    console.log(`Bulk action: ${action}`, Array.from(selectedTeamIds));
  };

  if (loading) {
    return (
      <div className="team-selection-dashboard">
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <p className="eyebrow">AI TEAM SELECTION</p>
            <h1>Your talent pool has signals.</h1>
            <p className="dashboard-hero-subtitle">We find the teams you might miss.</p>
          </div>
        </section>
        <LoadingState message="Loading team selection data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-selection-dashboard">
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <p className="eyebrow">AI TEAM SELECTION</p>
            <h1>Your talent pool has signals.</h1>
            <p className="dashboard-hero-subtitle">We find the teams you might miss.</p>
          </div>
        </section>
        <EmptyState
          title="Error loading team data"
          description={error}
          action="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="team-selection-dashboard">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p className="eyebrow">AI TEAM SELECTION</p>
          <h1>AI analyzes 30,000 teams</h1>
          <p className="dashboard-hero-subtitle">Identifying the 60 strongest candidates using AI-powered screening and ranking</p>
        </div>
        {dataSource === 'demo' && (
          <div className="data-source-badge data-source-badge--demo">
            DEMO DATA
          </div>
        )}
        {dataSource === 'api' && (
          <div className="data-source-badge data-source-badge--live">
            LIVE DATA
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="dashboard-stats" aria-label="Selection metrics">
        <StatCard 
          label="Total teams" 
          value={loading ? "…" : metrics.totalTeams.toLocaleString()} 
          note="In selection pool"
          accent="mint"
          loading={loading}
        />
        <StatCard 
          label="Teams analyzed" 
          value={loading ? "…" : metrics.analyzed.toLocaleString()} 
          note="By AI screening"
          accent="mint"
          loading={loading}
        />
        <StatCard 
          label="Teams selected" 
          value={loading ? "…" : metrics.selected.toLocaleString()} 
          note={`${metrics.selectionPercentage}% of pool`}
          accent={metrics.selected > 0 ? "coral" : "mint"}
          loading={loading}
        />
        <StatCard 
          label="Requiring review" 
          value={loading ? "…" : metrics.requiringReview.toLocaleString()} 
          note="Need human evaluation"
          accent={metrics.requiringReview > 0 ? "coral" : "mint"}
          loading={loading}
        />
      </section>

      {/* AI Selection Intelligence - Centerpiece */}
      <section className="dashboard-intelligence">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELECTION FUNNEL</p>
            <h2>AI Selection Progress</h2>
          </div>
          {metrics.hasMockTotal && (
            <span className="data-source data-source--demo">Demo pool size</span>
          )}
        </div>
        <SelectionFunnel funnel={metrics.funnel} loading={loading} />
      </section>

      {/* Team Search and Filters */}
      <section className="dashboard-section">
        <TeamSearch 
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
        />
      </section>

      {/* Multi-select Actions */}
      {selectedTeamIds.size > 0 && (
        <section className="dashboard-section">
          <div className="bulk-actions">
            <div className="bulk-actions-info">
              <span>{selectedTeamIds.size} teams selected</span>
            </div>
            <div className="bulk-actions-buttons">
              <button 
                className="bulk-action bulk-action--compare"
                onClick={() => setShowComparison(true)}
                type="button"
              >
                Compare Selected
              </button>
              <button 
                className="bulk-action bulk-action--shortlist"
                onClick={() => handleBulkAction('shortlist')}
                type="button"
              >
                Shortlist All
              </button>
              <button 
                className="bulk-action bulk-action--review"
                onClick={() => handleBulkAction('review')}
                type="button"
              >
                Add to Review
              </button>
              <button 
                className="bulk-action bulk-action--clear"
                onClick={() => setSelectedTeamIds(new Set())}
                type="button"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Team Rankings */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AI-RANKED CANDIDATES</p>
            <h2>
              {filters.stage === 'all' ? 'AI Ranking' : `${filters.stage.charAt(0).toUpperCase()}${filters.stage.slice(1)} Teams`}
              {filteredTeams.length !== teams.length && ` (${filteredTeams.length.toLocaleString()} filtered)`}
            </h2>
          </div>
          {teams.length > 0 && teams[0].hasDerivedMetrics && (
            <span className="data-source data-source--demo">Derived AI scores</span>
          )}
        </div>

        {paginatedTeams.length === 0 ? (
          <EmptyState
            title="No teams found"
            description="Try adjusting your filters or search terms"
          />
        ) : (
          <>
            <div className="data-panel">
              <div className="team-rankings">
                {paginatedTeams.map(team => (
                  <TeamRankingCard
                    key={team.id}
                    team={team}
                    isSelected={selectedTeamIds.has(team.id)}
                    onSelect={handleTeamSelect}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTeams.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>

      {/* Team Comparison Modal */}
      {showComparison && (
        <div className="comparison-modal-overlay" onClick={() => setShowComparison(false)}>
          <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
            <TeamComparison 
              teams={selectedTeams}
              onClose={() => setShowComparison(false)}
            />
          </div>
        </div>
      )}

      {/* Team Detail Drawer */}
      <TeamDetailDrawer
        team={detailTeam}
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      />
    </div>
  );
}
