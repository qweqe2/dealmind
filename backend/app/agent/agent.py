from typing import Optional

from sqlalchemy.orm import Session
from google import genai

from app.core.config import settings
from app.agent.tools import get_deals_needing_attention
from app.services.hindsight_service import hindsight_service


def _memory_text(memory: dict) -> str:
    """Safely extract text from a Hindsight memory."""
    if not isinstance(memory, dict):
        return ""

    return str(
        memory.get("text")
        or memory.get("content")
        or memory.get("memory")
        or ""
    ).strip()


def _is_preference_question(question: str) -> bool:
    """Detect questions asking about the user's personal preferences."""
    q = question.lower()

    preference_terms = (
        "my favorite",
        "my preferred",
        "my preference",
        "what do i prefer",
        "what is my preference",
        "what do i like",
        "what is my dashboard color",
        "favorite dashboard color",
        "favorite color",
        "preferred color",
        "dashboard color",
        "deal discussion order",
        "discussion order",
        "priority order",
        "preferred deal order",
    )

    return any(term in q for term in preference_terms)


def _is_relevant_preference_memory(question: str, memory: dict) -> bool:
    """
    Determine whether a recalled memory is relevant to the user's
    preference question.
    """
    text = _memory_text(memory).lower()
    q = question.lower()

    if not text:
        return False

    # ---------------------------------------------------------
    # Dashboard color preference
    # ---------------------------------------------------------
    if (
        "dashboard color" in q
        or "favorite dashboard color" in q
        or "favorite color" in q
        or "preferred color" in q
    ):
        return (
            "dashboard color" in text
            or "favorite dashboard color" in text
            or "favorite color" in text
            or "preferred color" in text
        )

    # ---------------------------------------------------------
    # Deal discussion order preference
    # ---------------------------------------------------------
    if (
        "deal discussion order" in q
        or "discussion order" in q
        or "preferred deal order" in q
        or "priority order" in q
    ):
        return (
            "discuss orion health first" in text
            or "orion health first" in text
            or "fieldstone bank second" in text
            or "deal discussion order" in text
            or "discussion order" in text
        )

    # ---------------------------------------------------------
    # Generic preference matching
    # ---------------------------------------------------------
    preference_words = (
        "user prefers",
        "user's favorite",
        "user favorite",
        "user preference",
        "the user prefers",
        "the user's favorite",
        "explicit personal preference",
    )

    return any(word in text for word in preference_words)


def _build_preference_context(question: str, memories: list[dict]) -> str:
    """
    Build a clean preference-only context.

    This prevents unrelated deal memories from confusing Gemini when
    the user asks about a personal preference.
    """
    relevant = [
        memory
        for memory in memories
        if _is_relevant_preference_memory(question, memory)
    ]

    if not relevant:
        return "NO_RELEVANT_PREFERENCE_MEMORY_FOUND"

    # Remove duplicate memory text while preserving order.
    seen = set()
    lines = []

    for memory in relevant:
        text = _memory_text(memory)

        if not text or text in seen:
            continue

        seen.add(text)
        lines.append(f"- {text}")

    return "\n".join(lines) if lines else "NO_RELEVANT_PREFERENCE_MEMORY_FOUND"


def _build_deal_context(db: Session) -> str:
    """Gather current deal information."""
    attention_deals = get_deals_needing_attention(db)

    if not attention_deals:
        return "No deals currently require attention."

    return "\n\n".join(
        [
            f"Deal #{deal['id']}: {deal['company']} - {deal['deal_name']}\n"
            f"Stage: {deal['stage']}\n"
            f"Notes: {deal['notes']}"
            for deal in attention_deals
        ]
    )


def run_agent(
    question: str,
    db: Session,
    deal_id: Optional[int] = None,
) -> dict:
    """
    Run the DealMind AI agent.

    The agent uses:
    - Hindsight for long-term memory
    - Current database information for deal context
    - Gemini for response generation

    Preference questions are handled separately so unrelated deal
    memories cannot override explicit user preferences.
    """

    if not settings.LLM_API_KEY:
        return {
            "answer": "AI Agent is not configured. Please add API key to .env file.",
            "memories": [],
        }

    question = question.strip()

    if not question:
        return {
            "answer": "Please enter a question.",
            "memories": [],
        }

    # ---------------------------------------------------------
    # Gemini
    # ---------------------------------------------------------

    client = genai.Client(api_key=settings.LLM_API_KEY)

    # ---------------------------------------------------------
    # Hindsight
    # ---------------------------------------------------------

    hindsight_bank_id = "dealmind-agent"

    recalled_memories = []

    if hindsight_service.enabled:
        hindsight_service.ensure_bank_exists(hindsight_bank_id)

        recalled_memories = hindsight_service.recall_memories(
            bank_id=hindsight_bank_id,
            query=question,
            types=["world", "experience", "observation"],
            max_tokens=3000,
            budget="high",
        )

    # ---------------------------------------------------------
    # Detect explicit preference statement
    # ---------------------------------------------------------

    remember_markers = (
        "remember this",
        "remember that",
        "remember:",
        "don't forget",
        "do not forget",
        "my preference is",
        "i prefer",
        "my preferred",
    )

    question_lower = question.lower()

    is_explicit_memory = any(
        marker in question_lower
        for marker in remember_markers
    )

    # Special handling for "my favorite" - only treat as explicit preference
    # if it's a statement (has "is" or ends with a period) rather than a question
    if "my favorite" in question_lower:
        # It's a statement if it contains "is" followed by content, or ends with punctuation
        # But NOT if it starts with question words
        question_words = ("what", "which", "how", "tell me", "show me")
        is_question = any(qw in question_lower for qw in question_words)
        
        # If it has "is" and doesn't start with question words, it's likely a statement
        if " is " in question_lower and not is_question:
            is_explicit_memory = True
        elif question_lower.endswith((".", "!")) and not is_question:
            is_explicit_memory = True

    # If user is stating an explicit preference, add it to recalled memories
    # so the response can immediately acknowledge it
    if is_explicit_memory:
        recalled_memories.insert(0, {
            "text": question,
            "type": "world",
            "metadata": {"is_explicit_preference": True}
        })

    # ---------------------------------------------------------
    # Detect question type
    # ---------------------------------------------------------

    preference_question = _is_preference_question(question)

    # ---------------------------------------------------------
    # Preference context
    # ---------------------------------------------------------

    preference_context = _build_preference_context(
        question,
        recalled_memories,
    )

    # ---------------------------------------------------------
    # Deal context
    # ---------------------------------------------------------

    deals_info = _build_deal_context(db)

    # ---------------------------------------------------------
    # Strict system prompt
    # ---------------------------------------------------------

    system_prompt = f"""
You are DealMind AI, an intelligent sales deal assistant with
strict long-term memory.

============================================================
ABSOLUTE MEMORY RULES
============================================================

1. Hindsight memories are the source of truth for remembered user
   preferences.

2. NEVER invent a preference.

3. NEVER claim that a preference is missing if a relevant preference
   memory is explicitly present in the provided memory context.

4. When the user asks about a personal preference, answer ONLY from
   relevant preference memories.

5. Do NOT use unrelated deal memories to answer personal preference
   questions.

6. Do NOT use an old or unrelated memory to override a directly
   matching preference memory.

7. If multiple matching preference memories say the same thing,
   treat them as confirmation rather than conflicting information.

8. If no relevant preference memory is provided, say that the
   preference is not currently recorded.

9. Do not expose internal memory-search details unless useful.

10. Keep preference answers short and direct.

============================================================
STRICT PREFERENCE RULE
============================================================

This is a preference question:
{preference_question}

Relevant preference memories:
-----------------------------
{preference_context}

If the relevant preference memory contains the answer, you MUST
answer using it.

For example:

If the memory says:
"The user's favorite dashboard color is orange."

and the user asks:
"What is my favorite dashboard color?"

the answer MUST be:
"Your favorite dashboard color is orange."

Do NOT answer:
"I don't have that information."

Do NOT answer:
"No matching preference is currently recorded."

when the matching memory is present.

IMPORTANT: If the user is explicitly stating a preference (e.g.,
"My favorite dashboard color is blue"), acknowledge it immediately
with a confirmation like "Understood. Your favorite dashboard color is blue."
even if this is the first time this preference is mentioned.

============================================================
DEAL RULES
============================================================

1. Use current deal information when the user asks about a deal.

2. Do not invent deal information.

3. Use remembered deal-related information when relevant.

4. Clearly distinguish remembered user preferences from current
   deal information.

5. For deal questions, provide concise and actionable answers.

============================================================
CURRENT DEAL INFORMATION
============================================================

{deals_info}
"""

    # Only include full memory list for non-preference questions
    # to prevent confusion with the filtered preference context
    if not preference_question:
        system_prompt += """

============================================================
RELEVANT LONG-TERM MEMORY
============================================================

{chr(10).join(
    f"- {_memory_text(memory)}"
    for memory in recalled_memories[:15]
    if _memory_text(memory)
) or "No relevant long-term memories were found."}
"""

    if deal_id:
        system_prompt += (
            f"\n\nThis conversation is associated with Deal #{deal_id}."
        )

    # ---------------------------------------------------------
    # Gemini response
    # ---------------------------------------------------------

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[
                system_prompt,
                f"User question:\n{question}",
            ],
        )

        answer = (response.text or "").strip()

        if not answer:
            raise ValueError("Gemini returned an empty response.")

    except Exception as exc:
        return {
            "answer": f"AI Agent error: {str(exc)}",
            "memories": recalled_memories,
        }

    # ---------------------------------------------------------
    # Store interaction
    # ---------------------------------------------------------

    if hindsight_service.enabled:

        if is_explicit_memory:
            hindsight_service.retain_memory(
                bank_id=hindsight_bank_id,
                content=question,
                context="explicit user preference / memory",
                document_id=f"preference_{deal_id or 'general'}",
            )
        else:
            hindsight_service.retain_memory(
                bank_id=hindsight_bank_id,
                content=f"User asked: {question}",
                context="user interaction",
                document_id=f"conversation_{deal_id or 'general'}",
            )

        if answer:
            hindsight_service.retain_memory(
                bank_id=hindsight_bank_id,
                content=f"Agent response: {answer[:1000]}",
                context="agent interaction",
                document_id=f"conversation_{deal_id or 'general'}",
            )

    return {
        "answer": answer,
        "memories": recalled_memories,
    }