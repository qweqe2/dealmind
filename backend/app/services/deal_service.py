from sqlalchemy.orm import Session
from typing import Optional
from app.models import Deal, Timeline, Memory
from app.schemas.deal import DealCreate, DealUpdate


class DealService:
    """Service layer for deal operations."""

    @staticmethod
    def get_deals(db: Session, skip: int = 0, limit: int = 100) -> list[Deal]:
        """Get all deals with pagination."""
        return db.query(Deal).offset(skip).limit(limit).all()

    @staticmethod
    def get_deal(db: Session, deal_id: int) -> Optional[Deal]:
        """Get a single deal by ID."""
        return db.query(Deal).filter(Deal.id == deal_id).first()

    @staticmethod
    def create_deal(db: Session, deal: DealCreate) -> Deal:
        """Create a new deal."""
        db_deal = Deal(**deal.model_dump())
        db.add(db_deal)
        db.commit()
        db.refresh(db_deal)
        return db_deal

    @staticmethod
    def update_deal(db: Session, deal_id: int, deal_update: DealUpdate) -> Optional[Deal]:
        """Update an existing deal."""
        db_deal = DealService.get_deal(db, deal_id)
        if not db_deal:
            return None

        # Update only provided fields
        update_data = deal_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_deal, field, value)

        db.commit()
        db.refresh(db_deal)
        return db_deal

    @staticmethod
    def delete_deal(db: Session, deal_id: int) -> bool:
        """Delete a deal."""
        db_deal = DealService.get_deal(db, deal_id)
        if not db_deal:
            return False

        db.delete(db_deal)
        db.commit()
        return True

    @staticmethod
    def get_deal_timeline(db: Session, deal_id: int) -> list[Timeline]:
        """Get timeline events for a deal."""
        return (
            db.query(Timeline)
            .filter(Timeline.deal_id == deal_id)
            .order_by(Timeline.date.desc())
            .all()
        )

    @staticmethod
    def get_deal_memories(db: Session, deal_id: int) -> list[Memory]:
        """Get memories for a deal."""
        return (
            db.query(Memory)
            .filter(Memory.deal_id == deal_id)
            .order_by(Memory.created_at.desc())
            .all()
        )
