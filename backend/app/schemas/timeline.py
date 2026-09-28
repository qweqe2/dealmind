from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date


class TimelineResponse(BaseModel):
    """Schema for timeline event responses."""

    id: int
    date: date
    title: str = Field(..., max_length=500)
    type: str = Field(..., max_length=50)
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
