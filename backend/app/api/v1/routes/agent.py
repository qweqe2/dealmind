from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agent.schemas import AgentChatRequest, AgentChatResponse, AgentPrepareRequest, AgentPrepareResponse
from app.agent.agent import run_agent

router = APIRouter()


@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(request: AgentChatRequest, db: Session = Depends(get_db)):
    """
    Chat with the AI agent about deals.

    The agent can:
    - Find deals that need attention
    - Get detailed information about specific deals
    - Answer questions about deal status and blockers
    """
    try:
        result = run_agent(
            question=request.message,
            db=db,
            deal_id=request.deal_id,
        )

        return AgentChatResponse(
            answer=result["answer"],
            memories=result.get("memories"),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}",
        )


@router.post("/prepare", response_model=AgentPrepareResponse)
def agent_prepare(request: AgentPrepareRequest, db: Session = Depends(get_db)):
    """
    Prepare a meeting brief for a specific deal.

    The agent will:
    - Analyze the deal context
    - Identify key stakeholders and concerns
    - Suggest talking points and questions
    - Surface relevant memories and timeline events
    """
    try:
        # For now, use the same agent logic with a specific question
        # TODO: Implement dedicated meeting preparation logic
        result = run_agent(
            question="Prepare a meeting brief for this deal. Include key talking points, potential blockers, and next steps.",
            db=db,
            deal_id=request.deal_id,
        )

        # Format as a brief structure
        brief = {
            "summary": result["answer"],
            "talking_points": [],
            "concerns": [],
            "next_steps": [],
        }

        return AgentPrepareResponse(
            brief=brief,
            memories=result.get("memories", []),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}",
        )
