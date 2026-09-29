const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function healthCheck(options) {
  return request("/api/health", options);
}

export function getDeals(options) {
  return request("/api/deals", options);
}

export function getDeal(dealId, options) {
  return request(`/api/deals/${encodeURIComponent(dealId)}`, options);
}

export function getDealTimeline(dealId, options) {
  return request(`/api/deals/${encodeURIComponent(dealId)}/timeline`, options);
}

export function getDealMemory(dealId, options) {
  return request(`/api/deals/${encodeURIComponent(dealId)}/memory`, options);
}

export function sendDealMessage(dealId, message, options) {
  return request("/api/agent/chat", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify({ deal_id: dealId, message }),
  });
}

export function prepareMeeting(dealId, options) {
  return request("/api/agent/prepare", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify({ deal_id: dealId }),
  });
}

export function generateWarRoom(dealId, options) {
  return request("/api/agent/war-room", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify({ deal_id: dealId }),
  });
}