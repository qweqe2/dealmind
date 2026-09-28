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
