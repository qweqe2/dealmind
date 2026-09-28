from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.agent.schemas import AgentChatRequest, AgentChatResponse
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
