import { getDeal, getDeals, getDealMemory, getDealTimeline, prepareMeeting, sendDealMessage } from "./api";
import { createDemoAnswer, createDemoBrief, demoDeals, getDemoDeal } from "./mockData";

export async function loadDeals() {
  try {
    const deals = await getDeals();
    if (!Array.isArray(deals)) throw new Error("Unexpected response from GET /api/deals");
    return { deals, source: "api" };
  } catch {
    return { deals: demoDeals, source: "demo" };
  }
}

export async function loadDealWorkspace(dealId) {
  const demo = getDemoDeal(dealId);
  const [dealResult, timelineResult, memoryResult] = await Promise.allSettled([
    getDeal(dealId),
    getDealTimeline(dealId),
    getDealMemory(dealId),
  ]);

  const deal = dealResult.status === "fulfilled" ? { ...demo, ...dealResult.value } : demo;
  const timeline = timelineResult.status === "fulfilled" && Array.isArray(timelineResult.value)
    ? timelineResult.value
    : demo.timeline;
  const memoryResponse = memoryResult.status === "fulfilled" ? memoryResult.value : null;
  const memories = Array.isArray(memoryResponse?.memories) ? memoryResponse.memories : demo.memories;
  const contractHasExtendedDealFields = ["value", "contact", "close_date", "notes"].every((field) => dealResult.value?.[field] != null);
  const source = [dealResult, timelineResult, memoryResult].every((result) => result.status === "fulfilled") && contractHasExtendedDealFields
    ? "api"
    : "demo";

  return { deal, timeline, memories, source };
}

export async function askAssistant(deal, message, memories = deal.memories || []) {
  try {
    const response = await sendDealMessage(deal.id, message);
    if (typeof response.answer !== "string" || !response.answer.trim()) throw new Error("Empty assistant response");
    return { ...response, source: "api" };
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return { answer: createDemoAnswer(deal, message), memories, source: "demo" };
  }
}

export async function generateMeetingBrief(deal, timeline = deal.timeline || []) {
  try {
    const response = await prepareMeeting(deal.id);
    if (!response.brief || typeof response.brief !== "object") throw new Error("Empty meeting brief");
    const demoBrief = createDemoBrief(deal, timeline);
    const brief = { ...demoBrief };
    let usedDemoContext = false;
    for (const [key, value] of Object.entries(response.brief)) {
      if (Array.isArray(value)) {
        if (value.length) brief[key] = value;
        else usedDemoContext = true;
      } else if (value) {
        brief[key] = value;
      } else {
        usedDemoContext = true;
      }
    }
    return { ...response, brief, source: usedDemoContext ? "demo" : "api" };
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return { brief: createDemoBrief(deal, timeline), memories: deal.memories || [], source: "demo" };
  }
}