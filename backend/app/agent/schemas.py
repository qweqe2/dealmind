from pydantic import BaseModel, Field
from typing import Optional


class AgentChatRequest(BaseModel):
    """Request schema for agent chat endpoint."""

    deal_id: Optional[int] = Field(None, description="Optional deal ID for context")
    message: str = Field(..., min_length=1, description="User question or message")


class AgentChatResponse(BaseModel):
    """Response schema for agent chat endpoint."""

    answer: str = Field(..., description="Agent's response")
    memories: Optional[list[dict]] = Field(default=None, description="Relevant memories used")


class AgentPrepareRequest(BaseModel):
    """Request schema for meeting preparation endpoint."""

    deal_id: int = Field(..., description="Deal ID to prepare meeting brief for")


class AgentPrepareResponse(BaseModel):
    """Response schema for meeting preparation endpoint."""

    brief: dict = Field(..., description="Meeting brief details")
    memories: list[dict] = Field(default_factory=list, description="Relevant memories")


class WarRoomResponse(BaseModel):
    """Response schema for Deal War Room endpoint."""

    summary: str = Field(..., description="Deal summary")
    primary_blocker: str = Field(..., description="Primary blocker")
    next_best_action: str = Field(..., description="Next best action")
    stakeholder: str = Field(..., description="Most relevant stakeholder")
    questions: list[str] = Field(default_factory=list, description="Questions to move deal forward")
    risks: list[str] = Field(default_factory=list, description="Deal risks")
    deal_id: Optional[int] = Field(None, description="Deal ID")
    company: Optional[str] = Field(None, description="Company name")
    deal_name: Optional[str] = Field(None, description="Deal name")
