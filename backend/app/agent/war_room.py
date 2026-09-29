from typing import Optional

from sqlalchemy.orm import Session
from google import genai

from app.core.config import settings
from app.agent.tools import get_deals_needing_attention
from app.services.hindsight_service import hindsight_service


def generate_war_room(
    db: Session,
    deal_id: Optional[int] = None,
) -> dict:
    """
    Generate a Deal War Room analysis.

    This is intentionally separate from run_agent() so the
    existing Deal Assistant behavior remains unchanged.
    """

    if not settings.LLM_API_KEY:
        raise ValueError("AI Agent is not configured.")

    # ---------------------------------------------------------
    # Get current deal information
    # ---------------------------------------------------------

    deals = get_deals_needing_attention(db)

    if deal_id is not None:
        deals = [
            deal for deal in deals
            if str(deal.get("id")) == str(deal_id)
        ]

    if not deals:
        return {
            "summary": "No deal information is currently available.",
            "primary_blocker": "Unknown",
            "next_best_action": "Review the deal record.",
            "stakeholder": "Unknown",
            "questions": [],
            "risks": [],
        }

    deal = deals[0]

    # ---------------------------------------------------------
    # Get relevant memory
    # ---------------------------------------------------------

    memories = []

    if hindsight_service.enabled:
        hindsight_bank_id = "dealmind-agent"

        hindsight_service.ensure_bank_exists(hindsight_bank_id)

        memories = hindsight_service.recall_memories(
            bank_id=hindsight_bank_id,
            query=(
                f"{deal.get('company', '')} "
                f"{deal.get('deal_name', '')} "
                "blocker stakeholder risk next step"
            ),
            types=["world", "experience", "observation"],
            max_tokens=3000,
            budget="high",
        )

    memory_text = "\n".join(
        f"- {memory.get('text', '')}"
        for memory in memories
        if isinstance(memory, dict) and memory.get("text")
    )

    # ---------------------------------------------------------
    # Build deal context
    # ---------------------------------------------------------

    deal_context = f"""
Deal ID: {deal.get("id")}
Company: {deal.get("company")}
Deal: {deal.get("deal_name")}
Stage: {deal.get("stage")}
Notes: {deal.get("notes")}
"""

    # ---------------------------------------------------------
    # Generate War Room analysis
    # ---------------------------------------------------------

    client = genai.Client(api_key=settings.LLM_API_KEY)

    prompt = f"""
You are DealMind's Deal War Room.

Analyze the following sales deal using ONLY the provided deal
information and relevant memories.

Do not invent facts.

DEAL INFORMATION
=================
{deal_context}

RELEVANT MEMORY
================
{memory_text or "No relevant memories found."}

Return ONLY valid JSON using exactly this structure:

{{
  "summary": "short deal summary",
  "primary_blocker": "main blocker",
  "next_best_action": "single most important next action",
  "stakeholder": "most relevant stakeholder",
  "questions": [
    "question 1",
    "question 2",
    "question 3"
  ],
  "risks": [
    "risk 1",
    "risk 2"
  ]
}}

Rules:
- Keep the summary concise.
- Identify the most important current blocker.
- Give one concrete next action.
- Do not invent stakeholder names.
- Questions should help move the deal forward.
- Risks must be supported by the provided context.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
    )

    answer = (response.text or "").strip()

    if not answer:
        raise ValueError("War Room returned an empty response.")

    # ---------------------------------------------------------
    # Parse JSON safely
    # ---------------------------------------------------------

    import json

    try:
        result = json.loads(answer)
    except json.JSONDecodeError:
        result = {
            "summary": answer,
            "primary_blocker": "See analysis",
            "next_best_action": "Review the generated analysis.",
            "stakeholder": "Unknown",
            "questions": [],
            "risks": [],
        }

    return {
        **result,
        "deal_id": deal.get("id"),
        "company": deal.get("company"),
        "deal_name": deal.get("deal_name"),
    }