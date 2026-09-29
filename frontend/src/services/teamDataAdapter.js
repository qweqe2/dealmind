/**
 * Data Adapter Layer
 * Transforms existing deal/CRM data into team selection data
 * This maintains backend compatibility while enabling the new team selection UI
 * 
 * DATA SOURCE CLARITY:
 * - AI scores, technical fit, market fit, etc. are DEMO/DERIVED values
 * - These are calculated from existing deal data for demonstration purposes
 * - In production, these would come from actual team selection API endpoints
 */

// Team selection stages
export const SELECTION_STAGES = {
  SCREENED: 'screened',
  MATCHED: 'matched', 
  QUALIFIED: 'qualified',
  SHORTLISTED: 'shortlisted',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  REVIEW: 'review'
};

/**
 * Transforms deal data into team selection data
 * 
 * IMPORTANT: AI scores and team metrics are DERIVED from deal data for demonstration.
 * In production, these would come from dedicated team selection AI analysis.
 * 
 * @param {Array} deals - Array of deal objects from API
 * @param {string} dataSource - 'api' or 'demo' to indicate data source
 * @returns {Array} - Transformed team data with selection metrics
 */
export const generateTeamSelectionData = (deals, dataSource = 'demo') => {
  // Transform existing deals into team candidates
  const teams = deals.map((deal, index) => {
    // Generate AI score based on deal value and status (DERIVED VALUE)
    const baseScore = deal.status === 'on_track' ? 85 : 75;
    const valueScore = Math.min((deal.value || 0) / 300000 * 15, 15);
    const aiScore = Math.round(baseScore + valueScore + Math.random() * 5);
    
    // Assign selection stage based on AI score and status (DERIVED VALUE)
    let selectionStage;
    if (aiScore >= 90) {
      selectionStage = SELECTION_STAGES.SELECTED;
    } else if (aiScore >= 80) {
      selectionStage = SELECTION_STAGES.SHORTLISTED;
    } else if (aiScore >= 70) {
      selectionStage = SELECTION_STAGES.QUALIFIED;
    } else if (aiScore >= 60) {
      selectionStage = SELECTION_STAGES.MATCHED;
    } else {
      selectionStage = SELECTION_STAGES.SCREENED;
    }
    
    // Generate team-specific attributes (DERIVED VALUES for demonstration)
    const industries = ['Healthcare', 'Logistics', 'Finance', 'Technology', 'Manufacturing', 'Retail'];
    const locations = ['San Francisco', 'New York', 'London', 'Berlin', 'Singapore', 'Tokyo'];
    const skills = ['Machine Learning', 'Data Engineering', 'Full Stack', 'DevOps', 'Cloud Architecture', 'Security'];
    
    return {
      id: deal.id,
      // Team identification
      teamName: deal.company,
      projectName: deal.deal_name,
      industry: industries[index % industries.length],
      location: locations[index % locations.length],
      
      // AI scoring (DERIVED VALUES - would be from team selection API in production)
      aiScore: aiScore,
      matchPercentage: aiScore,
      technicalFit: Math.round(aiScore - 5 + Math.random() * 10),
      marketFit: Math.round(aiScore - 3 + Math.random() * 8),
      teamExperience: Math.round(60 + Math.random() * 35),
      riskScore: Math.round(10 + Math.random() * 30),
      
      // Selection workflow
      selectionStage: selectionStage,
      rank: index + 1,
      
      // Team details (DERIVED VALUES for demonstration)
      teamSize: Math.round(5 + Math.random() * 20),
      foundedYear: Math.round(2015 + Math.random() * 8),
      fundingStage: ['Seed', 'Series A', 'Series B', 'Series C'][index % 4],
      
      // Contact/lead (REAL DATA from deals API)
      contact: deal.contact,
      
      // AI reasoning (DERIVED from deal insights)
      selectionReasoning: generateSelectionReasoning(aiScore, selectionStage, deal),
      keyStrengths: generateKeyStrengths(deal.insights),
      riskFactors: deal.insights?.filter(i => i.tone === 'risk').map(i => i.detail) || [],
      
      // Original deal data (for compatibility with existing backend)
      originalDeal: deal,
      
      // Metadata
      lastUpdated: deal.last_activity,
      createdAt: '2026-09-01',
      
      // Data source tracking
      dataSource: dataSource,
      hasDerivedMetrics: true // Flag to indicate metrics are derived, not from team selection API
    };
  });
  
  return teams;
};

// Generate mock explanation for why AI selected this team
function generateSelectionReasoning(aiScore, stage, deal) {
  const reasons = {
    [SELECTION_STAGES.SELECTED]: [
      'Exceptional technical capability with proven track record',
      'Strong market fit and scalable business model',
      'Experienced leadership team with relevant domain expertise',
      'Low risk profile with clear growth trajectory'
    ],
    [SELECTION_STAGES.SHORTLISTED]: [
      'Strong technical foundation and market positioning',
      'Good team experience with relevant skills',
      'Promising early traction and customer validation',
      'Manageable risk profile with clear mitigation strategies'
    ],
    [SELECTION_STAGES.QUALIFIED]: [
      'Solid technical capabilities and market potential',
      'Experienced team with relevant background',
      'Early signs of product-market fit',
      'Moderate risk profile with identified growth path'
    ],
    [SELECTION_STAGES.MATCHED]: [
      'Basic technical requirements met',
      'Relevant industry experience',
      'Initial market validation',
      'Risk factors identified and assessable'
    ],
    [SELECTION_STAGES.SCREENED]: [
      'Initial screening completed',
      'Basic criteria evaluation',
      'Requires deeper analysis',
      'Risk factors need evaluation'
    ]
  };
  
  const stageReasons = reasons[stage] || reasons[SELECTION_STAGES.SCREENED];
  return stageReasons[Math.floor(Math.random() * stageReasons.length)];
}

// Generate key strengths from deal insights
function generateKeyStrengths(insights) {
  if (!insights) return ['Experienced team', 'Strong market fit'];
  
  return insights
    .filter(i => i.tone === 'positive')
    .map(i => i.title)
    .concat(['Technical expertise', 'Market knowledge'])
    .slice(0, 4);
}

/**
 * Calculate funnel metrics from team data
 * 
 * IMPORTANT: The 30,000 total teams figure is a MOCK value for demonstration.
 * In production, this would come from the actual team selection pool size.
 * 
 * @param {Array} teams - Array of team objects
 * @returns {Object} - Funnel metrics with mock total pool size
 */
export const calculateFunnelMetrics = (teams) => {
  const totalTeams = 30000; // MOCK VALUE - would be real pool size in production
  const analyzed = teams.length;
  
  const stageCounts = {
    [SELECTION_STAGES.SCREENED]: teams.filter(t => t.selectionStage === SELECTION_STAGES.SCREENED).length,
    [SELECTION_STAGES.MATCHED]: teams.filter(t => t.selectionStage === SELECTION_STAGES.MATCHED).length,
    [SELECTION_STAGES.QUALIFIED]: teams.filter(t => t.selectionStage === SELECTION_STAGES.QUALIFIED).length,
    [SELECTION_STAGES.SHORTLISTED]: teams.filter(t => t.selectionStage === SELECTION_STAGES.SHORTLISTED).length,
    [SELECTION_STAGES.SELECTED]: teams.filter(t => t.selectionStage === SELECTION_STAGES.SELECTED).length,
  };
  
  return {
    totalTeams,
    analyzed,
    matched: stageCounts[SELECTION_STAGES.MATCHED] + stageCounts[SELECTION_STAGES.QUALIFIED] + stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED],
    qualified: stageCounts[SELECTION_STAGES.QUALIFIED] + stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED],
    shortlisted: stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED],
    selected: stageCounts[SELECTION_STAGES.SELECTED],
    selectionPercentage: totalTeams > 0 ? ((stageCounts[SELECTION_STAGES.SELECTED] / totalTeams) * 100).toFixed(2) : 0,
    requiringReview: teams.filter(t => t.selectionStage === SELECTION_STAGES.REVIEW).length,
    funnel: [
      { stage: 'Total Pool', count: totalTeams, percentage: 100 },
      { stage: 'Screened', count: totalTeams, percentage: 100 },
      { stage: 'Matched', count: stageCounts[SELECTION_STAGES.MATCHED] + stageCounts[SELECTION_STAGES.QUALIFIED] + stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED], percentage: ((stageCounts[SELECTION_STAGES.MATCHED] + stageCounts[SELECTION_STAGES.QUALIFIED] + stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED]) / totalTeams * 100).toFixed(1) },
      { stage: 'Qualified', count: stageCounts[SELECTION_STAGES.QUALIFIED] + stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED], percentage: ((stageCounts[SELECTION_STAGES.QUALIFIED] + stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED]) / totalTeams * 100).toFixed(1) },
      { stage: 'Shortlisted', count: stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED], percentage: ((stageCounts[SELECTION_STAGES.SHORTLISTED] + stageCounts[SELECTION_STAGES.SELECTED]) / totalTeams * 100).toFixed(1) },
      { stage: 'Selected', count: stageCounts[SELECTION_STAGES.SELECTED], percentage: (stageCounts[SELECTION_STAGES.SELECTED] / totalTeams * 100).toFixed(1) }
    ],
    hasMockTotal: true // Flag to indicate total pool size is mocked
  };
};

// Filter and sort teams
export const filterTeams = (teams, filters) => {
  let filtered = [...teams];
  
  // Text search
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(team => 
      team.teamName?.toLowerCase().includes(search) ||
      team.projectName?.toLowerCase().includes(search) ||
      team.industry?.toLowerCase().includes(search) ||
      team.location?.toLowerCase().includes(search)
    );
  }
  
  // Stage filter
  if (filters.stage && filters.stage !== 'all') {
    filtered = filtered.filter(team => team.selectionStage === filters.stage);
  }
  
  // AI score range
  if (filters.minScore !== undefined) {
    filtered = filtered.filter(team => team.aiScore >= filters.minScore);
  }
  if (filters.maxScore !== undefined) {
    filtered = filtered.filter(team => team.aiScore <= filters.maxScore);
  }
  
  // Industry filter
  if (filters.industry && filters.industry !== 'all') {
    filtered = filtered.filter(team => team.industry === filters.industry);
  }
  
  // Location filter
  if (filters.location && filters.location !== 'all') {
    filtered = filtered.filter(team => team.location === filters.location);
  }
  
  // Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const direction = filters.sortDirection === 'desc' ? -1 : 1;
      
      switch (filters.sortBy) {
        case 'aiScore':
          return (b.aiScore - a.aiScore) * direction;
        case 'technicalFit':
          return (b.technicalFit - a.technicalFit) * direction;
        case 'marketFit':
          return (b.marketFit - a.marketFit) * direction;
        case 'teamExperience':
          return (b.teamExperience - a.teamExperience) * direction;
        case 'riskScore':
          return (a.riskScore - b.riskScore) * direction; // Lower risk is better
        case 'teamName':
          return a.teamName.localeCompare(b.teamName) * direction;
        default:
          return 0;
      }
    });
  }
  
  return filtered;
};

// Paginate teams
export const paginateTeams = (teams, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    teams: teams.slice(startIndex, endIndex),
    totalPages: Math.ceil(teams.length / pageSize),
    currentPage: page,
    totalTeams: teams.length,
    hasNextPage: endIndex < teams.length,
    hasPreviousPage: page > 1
  };
};

// Get unique values for filters
export const getFilterOptions = (teams) => {
  const industries = [...new Set(teams.map(t => t.industry).filter(Boolean))];
  const locations = [...new Set(teams.map(t => t.location).filter(Boolean))];
  
  return {
    industries: ['all', ...industries.sort()],
    locations: ['all', ...locations.sort()],
    stages: ['all', ...Object.values(SELECTION_STAGES)]
  };
};