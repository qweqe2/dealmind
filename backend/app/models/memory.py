from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Memory(Base):
    """Memory/notes associated with a deal for AI agent context."""

    __tablename__ = "memories"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"), nullable=False, index=True)

    # Memory information
    content = Column(Text, nullable=False)
    source = Column(String(500), nullable=True)  # e.g., "Meeting 3", "Discovery call, Sep 18"

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    deal = relationship("Deal", back_populates="memories")

    def __repr__(self):
        return f"<Memory(id={self.id}, deal_id={self.deal_id}, source='{self.source}')>"
