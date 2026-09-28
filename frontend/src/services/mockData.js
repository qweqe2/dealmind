export const demoDeals = [
  {
    id: 1,
    company: "Orion Health",
    deal_name: "Clinical Insights Platform",
    stage: "Security review",
    status: "needs_attention",
    value: 185000,
    currency: "USD",
    contact: { name: "Mira Chen", role: "VP of Data", email: "mira.chen@orionhealth.example" },
    owner: "Tuba Tanveer",
    close_date: "2026-10-23",
    last_activity: "2026-09-24",
    next_meeting: "2026-10-02T14:30:00",
    notes: "Security review is the remaining gate before procurement. Mira requested a clear data-retention summary and a named owner for the implementation plan.",
    insights: [
      { title: "Security review is the primary blocker", detail: "The team has not received a written response on data retention and access controls.", tone: "risk" },
      { title: "Executive sponsor is engaged", detail: "Mira has offered to bring the CFO into the next conversation if the security review is resolved.", tone: "positive" },
      { title: "Confirm implementation ownership", detail: "No customer-side technical owner has been named for rollout planning.", tone: "watch" },
    ],
    timeline: [
      { id: "o-1", date: "2026-09-24", title: "Security questionnaire received", type: "risk", description: "Customer security team sent follow-up questions on retention and audit logs." },
      { id: "o-2", date: "2026-09-18", title: "Solution review with data team", type: "meeting", description: "Reviewed analytics workflows and agreed on a limited pilot scope." },
      { id: "o-3", date: "2026-09-10", title: "Commercial proposal shared", type: "proposal", description: "Annual subscription proposal sent to Mira and procurement." },
      { id: "o-4", date: "2026-09-03", title: "Discovery completed", type: "discovery", description: "Confirmed reporting delays and fragmented clinical data as core needs." },
    ],
    memories: [
      { id: "o-m1", content: "Data cannot leave the approved US hosting region.", source: "Solution review, Sep 18" },
      { id: "o-m2", content: "The CFO wants a measurable reduction in analyst reporting time before approving expansion.", source: "Discovery, Sep 3" },
    ],
  },
  {
    id: 2,
    company: "Northstar Logistics",
    deal_name: "Fleet Operations Suite",
    stage: "Pilot",
    status: "on_track",
    value: 92000,
    currency: "USD",
    contact: { name: "Rafael Ortiz", role: "Director of Operations", email: "rafael.ortiz@northstar.example" },
    owner: "Tuba Tanveer",
    close_date: "2026-11-13",
    last_activity: "2026-09-25",
    next_meeting: "2026-10-05T10:00:00",
    notes: "Pilot is active at two regional hubs. The operations team will share baseline dispatch metrics before the next review.",
    insights: [
      { title: "Pilot adoption is healthy", detail: "Both launch sites are using the dispatch dashboard weekly.", tone: "positive" },
      { title: "Agree success criteria", detail: "Baseline and target metrics still need written approval from operations leadership.", tone: "watch" },
    ],
    timeline: [
      { id: "n-1", date: "2026-09-25", title: "Pilot usage check-in", type: "meeting", description: "Two hubs confirmed active use; dispatch feedback was positive." },
      { id: "n-2", date: "2026-09-12", title: "Pilot launched", type: "milestone", description: "Workspace enabled for the North and Central regional teams." },
      { id: "n-3", date: "2026-09-04", title: "Pilot scope approved", type: "proposal", description: "Customer approved a six-week pilot across two hubs." },
    ],
    memories: [
      { id: "n-m1", content: "Dispatch managers want mobile access during shift handoffs.", source: "Pilot kickoff, Sep 12" },
      { id: "n-m2", content: "Success will be measured by fewer manual dispatch corrections.", source: "Pilot scope, Sep 4" },
    ],
  },
  {
    id: 3,
    company: "Fieldstone Bank",
    deal_name: "Risk Analytics Modernization",
    stage: "Negotiation",
    status: "needs_attention",
    value: 240000,
    currency: "USD",
    contact: { name: "Priya Nair", role: "Chief Risk Officer", email: "priya.nair@fieldstone.example" },
    owner: "Tuba Tanveer",
    close_date: "2026-10-30",
    last_activity: "2026-09-22",
    next_meeting: "2026-10-01T11:00:00",
    notes: "The risk team supports the proposal, but finance has asked for a phased rollout and revised year-one pricing.",
    insights: [
      { title: "Commercial terms need alignment", detail: "Finance requested a phased rollout and a revised first-year structure.", tone: "risk" },
      { title: "Strong operational fit", detail: "Risk analysts validated the proposed workflow against two priority use cases.", tone: "positive" },
    ],
    timeline: [
      { id: "f-1", date: "2026-09-22", title: "Finance requested revised terms", type: "risk", description: "CFO office asked for phased pricing and a lower first-year commitment." },
      { id: "f-2", date: "2026-09-16", title: "Risk workflow validation", type: "meeting", description: "Analysts confirmed fit for fraud trend and portfolio monitoring workflows." },
      { id: "f-3", date: "2026-09-08", title: "Proposal review", type: "proposal", description: "Reviewed annual proposal with risk leadership and procurement." },
    ],
    memories: [
      { id: "f-m1", content: "CFO approval depends on phasing costs across two budget periods.", source: "Commercial review, Sep 22" },
      { id: "f-m2", content: "Risk leadership prefers a working session with finance before final approval.", source: "Workflow review, Sep 16" },
    ],
  },
];

export function getDemoDeal(dealId) {
  return demoDeals.find((deal) => String(deal.id) === String(dealId)) || {
    ...demoDeals[0],
    id: dealId,
    company: "Sample customer",
    deal_name: `Opportunity ${dealId}`,
  };
}

export function createDemoAnswer(deal, question) {
  const prompt = question.toLowerCase();
  if (prompt.includes("risk") || prompt.includes("block") || prompt.includes("stuck")) {
    return `The main watch item for ${deal.company} is ${deal.insights.find((insight) => insight.tone === "risk")?.detail || "confirming the customer's remaining approval criteria"} Start by confirming the owner and target date for that issue.`;
  }
  if (prompt.includes("next") || prompt.includes("do")) {
    return `Next, align with ${deal.contact.name} on the open items, then agree on one dated customer action. The next scheduled touchpoint is ${new Date(deal.next_meeting).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.`;
  }
  if (prompt.includes("meeting") || prompt.includes("prepare")) {
    return `For the meeting with ${deal.company}, confirm the customer's success criteria, address the current ${deal.stage.toLowerCase()} concerns, and leave with an owner and date for the next decision.`;
  }
  if (prompt.includes("summar")) {
    return `${deal.deal_name} is a ${formatCurrency(deal.value)} opportunity at ${deal.stage}. ${deal.notes}`;
  }
  return `This ${formatCurrency(deal.value)} opportunity is currently in ${deal.stage}. The latest activity was ${deal.last_activity}; the most useful next step is to validate the open customer concern with ${deal.contact.name}.`;
}

export function createDemoBrief(deal, timeline = deal.timeline || []) {
  return {
    deal_stage: deal.stage,
    summary: `${deal.company} is evaluating ${deal.deal_name}, a ${formatCurrency(deal.value)} opportunity. ${deal.notes}`,
    stakeholders: [`${deal.contact.name} (${deal.contact.role})`],
    interests: ["Resolve the core workflow needs", "Establish clear success measures"],
    previous_interactions: timeline.slice(0, 3).map((event) => `${event.date}: ${event.title}`),
    objections: deal.insights.filter((insight) => insight.tone === "risk").map((insight) => insight.detail),
    competitors: [],
    commitments: ["Confirm owners and dates for open actions"],
    unresolved_issues: deal.insights.filter((insight) => insight.tone !== "positive").map((insight) => insight.title),
    suggested_talking_points: [
      `Ask ${deal.contact.name} to confirm the top decision criteria`,
      "Review progress against the customer's success measures",
      "Agree on a dated next step and the people required",
    ],
    suggested_focus: deal.insights.find((insight) => insight.tone === "risk")?.title || "Confirm the next decision milestone",
    next_steps: ["Confirm remaining questions", "Document decision owner and target date", "Send a written recap after the meeting"],
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}