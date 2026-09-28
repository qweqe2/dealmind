from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Deal(Base):
    """Deal model representing a sales opportunity."""

    __tablename__ = "deals"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Core deal information
    company = Column(String(255), nullable=False, index=True)
    deal_name = Column(String(255), nullable=False)
    stage = Column(String(100), nullable=False, index=True)
    status = Column(String(50), nullable=False, index=True)  # needs_attention, on_track

    # Financial information
    value = Column(Numeric(precision=12, scale=2), nullable=True)
    currency = Column(String(3), default="USD")

    # Contact information
    owner = Column(String(255), nullable=True)
    contact_name = Column(String(255), nullable=True)
    contact_role = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)

    # Timeline information
    close_date = Column(Date, nullable=True)
    last_activity = Column(Date, nullable=True)
    next_meeting = Column(DateTime, nullable=True)

    # Additional context
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    timeline = relationship("Timeline", back_populates="deal", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="deal", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Deal(id={self.id}, company='{self.company}', deal_name='{self.deal_name}', stage='{self.stage}')>"
