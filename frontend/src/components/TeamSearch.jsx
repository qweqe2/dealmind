/**
 * TeamSearch Component
 * Global team search with advanced filters and sorting
 */

import { useState, useCallback } from 'react';

export default function TeamSearch({ onSearch, onFilterChange, filterOptions = {} }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    stage: 'all',
    industry: 'all',
    location: 'all',
    minScore: undefined,
    maxScore: undefined,
    sortBy: 'aiScore',
    sortDirection: 'desc'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search for better performance
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    onSearch?.(value, { ...filters, search: value });
  }, [filters, onSearch]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (sortBy) => {
    const newDirection = filters.sortBy === sortBy && filters.sortDirection === 'desc' ? 'asc' : 'desc';
    const newFilters = { ...filters, sortBy, sortDirection: newDirection };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="team-search">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search teams by name, industry, skills, location..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {search && (
            <button 
              className="clear-search"
              onClick={() => handleSearchChange('')}
              type="button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <button 
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
        >
          <span>Advanced Filters</span>
          <span className={`chevron ${showAdvanced ? 'chevron--up' : ''}`}>▼</span>
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>Selection Stage</label>
            <select 
              value={filters.stage}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
            >
              <option value="all">All Stages</option>
              {filterOptions.stages?.filter(s => s !== 'all').map(stage => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Industry</label>
            <select 
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
            >
              <option value="all">All Industries</option>
              {filterOptions.industries?.filter(i => i !== 'all').map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select 
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="all">All Locations</option>
              {filterOptions.locations?.filter(l => l !== 'all').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>AI Score Range</label>
            <div className="score-range">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                value={filters.minScore || ''}
                onChange={(e) => handleFilterChange('minScore', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                value={filters.maxScore || ''}
                onChange={(e) => handleFilterChange('maxScore', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <div className="sort-options">
              {[
                { value: 'aiScore', label: 'AI Score' },
                { value: 'technicalFit', label: 'Technical Fit' },
                { value: 'marketFit', label: 'Market Fit' },
                { value: 'teamExperience', label: 'Experience' },
                { value: 'riskScore', label: 'Risk (Low to High)' },
                { value: 'teamName', label: 'Team Name' }
              ].map(option => (
                <button
                  key={option.value}
                  className={`sort-option ${filters.sortBy === option.value ? 'sort-option--active' : ''}`}
                  onClick={() => handleSortChange(option.value)}
                  type="button"
                >
                  {option.label}
                  {filters.sortBy === option.value && (
                    <span className="sort-direction">{filters.sortDirection === 'desc' ? '↓' : '↑'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="reset-filters"
            onClick={() => {
              const resetFilters = {
                stage: 'all',
                industry: 'all',
                location: 'all',
                minScore: undefined,
                maxScore: undefined,
                sortBy: 'aiScore',
                sortDirection: 'desc'
              };
              setFilters(resetFilters);
              onFilterChange?.(resetFilters);
            }}
            type="button"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
