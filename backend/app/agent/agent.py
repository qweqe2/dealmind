import json
from typing import Optional
from sqlalchemy.orm import Session
from anthropic import Anthropic, AuthenticationError, BadRequestError
from app.core.config import settings
from app.agent.tools import get_deals_needing_attention, get_deal_details
from app.services.hindsight_service import hindsight_service


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

    # Hindsight memory bank ID
    hindsight_bank_id = "dealmind-agent"

    # Ensure Hindsight bank exists
    if hindsight_service.enabled:
        hindsight_service.ensure_bank_exists(hindsight_bank_id)

    # Recall relevant memories before processing
    recalled_memories = []
    if hindsight_service.enabled:
        recalled_memories = hindsight_service.recall_memories(
            bank_id=hindsight_bank_id,
            query=question,
            types=["world", "experience", "observation"],
            max_tokens=2048,
            budget="mid",
        )

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

    # Add recalled memories to context if available
    memory_context = ""
    if recalled_memories:
        memory_context = "\n\nRelevant memories from previous conversations:\n"
        for memory in recalled_memories[:5]:  # Limit to top 5 memories
            memory_context += f"- {memory['text']}\n"
        system_prompt += memory_context

    # Simple single-turn approach: Get deals needing attention and answer
    attention_deals = get_deals_needing_attention(db)

    if not attention_deals:
        # Still retain memory even if no deals need attention
        if hindsight_service.enabled and question:
            hindsight_service.retain_memory(
                bank_id=hindsight_bank_id,
                content=f"User asked: {question}. No deals currently need attention.",
                context="agent interaction",
                document_id=f"conversation_{deal_id or 'general'}",
            )

        return {
            "answer": "Great news! No deals currently need attention. All deals are on track.",
            "memories": recalled_memories,
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
            "memories": recalled_memories,
        }
    except BadRequestError as e:
        if "credit balance" in str(e):
            return {
                "answer": "Anthropic account has no credits. Add credits at console.anthropic.com (Plans & Billing), then retry.",
                "memories": recalled_memories,
            }
        raise

    answer = response.content[0].text

    # Retain useful information from this interaction
    if hindsight_service.enabled:
        # Store the user's question and the context
        hindsight_service.retain_memory(
            bank_id=hindsight_bank_id,
            content=f"User asked: {question}",
            context="user question",
            document_id=f"conversation_{deal_id or 'general'}",
        )

        # Store important observations if the answer contains actionable insights
        if "attention" in answer.lower() or "blocker" in answer.lower() or "action" in answer.lower():
            hindsight_service.retain_memory(
                bank_id=hindsight_bank_id,
                content=f"Agent observation: {answer[:500]}",
                context="agent observation",
                document_id=f"conversation_{deal_id or 'general'}",
            )

    return {
        "answer": answer.strip(),
        "memories": recalled_memories,
    }
