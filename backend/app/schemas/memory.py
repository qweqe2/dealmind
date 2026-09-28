from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class MemoryResponse(BaseModel):
    """Schema for memory responses."""

    id: int | str  # Support both int and string IDs for compatibility
    content: str
    source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MemoryListResponse(BaseModel):
    """Schema for GET /api/deals/{id}/memory response."""

    memories: list[MemoryResponse]
