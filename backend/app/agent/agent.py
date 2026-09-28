import json
from typing import Optional
from sqlalchemy.orm import Session
from anthropic import Anthropic, AuthenticationError
from app.core.config import settings
from app.agent.tools import get_deals_needing_attention, get_deal_details


def run_agent(question: str, db: Session, deal_id: Optional[int] = None) -> dict:
    """
    Run the AI agent to answer a question about deals.

    Args:
        question: User's question
        db: Database session
        deal_id: Optional deal ID for context

    Returns:
        dict with 'answer' and optional 'memories'
    """
    if not settings.LLM_API_KEY:
        return {
            "answer": "AI Agent is not configured. Please add API key to .env file.",
            "memories": [],
        }

    # Use Anthropic SDK with the configured API key
    client = Anthropic(api_key=settings.LLM_API_KEY)

    # Build system prompt
    system_prompt = """You are DealMind AI, a sales deal assistant. You help sales teams understand their deals, identify blockers, and take action.

When answering questions:
- Be concise and actionable
- Focus on what needs attention and why
- Cite specific deal names when relevant

You have access to these tools:
1. get_deals_needing_attention() - Get all deals with status='needs_attention'
2. get_deal_details(deal_id) - Get detailed info about a specific deal

To use a tool, respond with JSON:
{"tool": "get_deals_needing_attention"} or {"tool": "get_deal_details", "deal_id": 1}

After getting tool results, provide a natural language answer."""

    if deal_id:
        system_prompt += f"\n\nContext: The user is asking about deal #{deal_id}."

    # Simple single-turn approach: Get deals needing attention and answer
    attention_deals = get_deals_needing_attention(db)

    if not attention_deals:
        return {
            "answer": "Great news! No deals currently need attention. All deals are on track.",
            "memories": [],
        }

    # Format deals data for LLM
    deals_info = "\n\n".join([
        f"Deal #{d['id']}: {d['company']} - {d['deal_name']}\n"
        f"Stage: {d['stage']}\n"
        f"Notes: {d['notes']}"
        for d in attention_deals
    ])

    # Ask LLM to summarize
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Here are the deals that need attention:\n\n{deals_info}\n\nQuestion: {question}"}
            ],
        )
    except AuthenticationError:
        return {
            "answer": "LLM API key is invalid. Please update LLM_API_KEY in backend/.env with a valid Anthropic API key.",
            "memories": [],
        }

    answer = response.content[0].text

    return {
        "answer": answer.strip(),
        "memories": [],
    }
