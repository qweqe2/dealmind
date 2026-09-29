const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}

export async function getDeals() {
  const response = await fetch(`${API_BASE_URL}/api/deals`);

  if (!response.ok) {
    throw new Error("Failed to fetch deals");
  }

  return response.json();
}

export async function chatWithAgent(dealId, message) {
  const payload = {
    message: message,
  };

  // Only include deal_id if it's provided
  if (dealId) {
    payload.deal_id = parseInt(dealId, 10);
  }

  const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to chat with agent");
  }

  return response.json();
}