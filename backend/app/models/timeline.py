from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Timeline(Base):
    """Timeline events associated with a deal."""

    __tablename__ = "timeline"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="CASCADE"), nullable=False, index=True)

    # Event information
    date = Column(Date, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    type = Column(String(50), nullable=False)  # interest, meeting, proposal, risk, milestone, discovery
    description = Column(Text, nullable=True)

    # Relationship
    deal = relationship("Deal", back_populates="timeline")

    def __repr__(self):
        return f"<Timeline(id={self.id}, deal_id={self.deal_id}, date='{self.date}', title='{self.title}')>"
