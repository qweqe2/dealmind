from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str

    class Config:
        from_attributes = True
