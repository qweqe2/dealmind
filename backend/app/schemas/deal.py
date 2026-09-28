from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class DealBase(BaseModel):
    """Base deal schema with common fields."""

    company: str = Field(..., min_length=1, max_length=255)
    deal_name: str = Field(..., min_length=1, max_length=255)
    stage: str = Field(..., min_length=1, max_length=100)
    status: str = Field(..., min_length=1, max_length=50)
    value: Optional[Decimal] = None
    currency: str = Field(default="USD", max_length=3)
    owner: Optional[str] = Field(None, max_length=255)
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_role: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[str] = Field(None, max_length=255)
    close_date: Optional[date] = None
    last_activity: Optional[date] = None
    next_meeting: Optional[datetime] = None
    notes: Optional[str] = None


class DealCreate(DealBase):
    """Schema for creating a new deal."""

    pass


class DealUpdate(BaseModel):
    """Schema for updating an existing deal (all fields optional)."""

    company: Optional[str] = Field(None, min_length=1, max_length=255)
    deal_name: Optional[str] = Field(None, min_length=1, max_length=255)
    stage: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    value: Optional[Decimal] = None
    currency: Optional[str] = Field(None, max_length=3)
    owner: Optional[str] = Field(None, max_length=255)
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_role: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[str] = Field(None, max_length=255)
    close_date: Optional[date] = None
    last_activity: Optional[date] = None
    next_meeting: Optional[datetime] = None
    notes: Optional[str] = None


class DealResponse(DealBase):
    """Schema for deal API responses."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DealListResponse(BaseModel):
    """Simplified schema for deal list responses (matches API_CONTRACT.md)."""

    id: int
    company: str
    deal_name: str
    stage: str
    status: str

    model_config = ConfigDict(from_attributes=True)
