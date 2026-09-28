# DealMind API Contract

Base URL:

http://127.0.0.1:8000

---

## 1. Health Check

GET /api/health

Response:

{
  "status": "ok"
}

---

# Deals

## 2. Get All Deals

GET /api/deals

Response:

[
  {
    "id": 1,
    "company": "ABC Corp",
    "deal_name": "AI Analytics Platform",
    "stage": "Negotiation",
    "status": "needs_attention"
  }
]

---

## 3. Get Deal

GET /api/deals/{deal_id}

Response:

{
  "id": 1,
  "company": "ABC Corp",
  "deal_name": "AI Analytics Platform",
  "stage": "Negotiation",
  "status": "needs_attention"
}

---

## 4. Get Deal Timeline

GET /api/deals/{deal_id}/timeline

Response:

[
  {
    "id": 1,
    "date": "2026-09-01",
    "title": "Customer interested in AI analytics",
    "type": "interest"
  }
]

---

## 5. Get Deal Memory

GET /api/deals/{deal_id}/memory

Response:

{
  "memories": [
    {
      "id": "memory-1",
      "content": "CTO raised a security concern",
      "source": "Meeting 3"
    }
  ]
}

---

# Meetings

## 6. Create Meeting

POST /api/meetings

Request:

{
  "deal_id": 1,
  "notes": "Customer raised pricing concerns."
}

Response:

{
  "success": true,
  "meeting_id": 9
}

---

# AI Agent

## 7. Deal Detective

POST /api/agent/chat

Request:

{
  "deal_id": 1,
  "message": "Why is this deal stuck?"
}

Response:

{
  "answer": "The main unresolved issue is pricing.",
  "memories": [
    {
      "content": "CFO raised pricing objection",
      "source": "Meeting 4"
    }
  ]
}

---

## 8. Meeting Brief

POST /api/agent/prepare

Request:

{
  "deal_id": 1
}

Response:

{
  "brief": {
    "deal_stage": "Negotiation",
    "stakeholders": [],
    "interests": [],
    "objections": [],
    "competitors": [],
    "commitments": [],
    "unresolved_issues": [],
    "suggested_focus": ""
  },
  "memories": []
}