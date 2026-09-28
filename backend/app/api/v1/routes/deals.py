from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.deal_service import DealService
from app.schemas.deal import DealListResponse, DealResponse
from app.schemas.timeline import TimelineResponse
from app.schemas.memory import MemoryListResponse

router = APIRouter()


@router.get("", response_model=list[DealListResponse])
def get_deals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all deals.

    Returns simplified deal list matching API_CONTRACT.md format.
    """
    deals = DealService.get_deals(db, skip=skip, limit=limit)
    return deals


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    """
    Get a single deal by ID.

    Returns full deal details matching API_CONTRACT.md format.
    """
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found"
        )
    return deal


@router.get("/{deal_id}/timeline", response_model=list[TimelineResponse])
def get_deal_timeline(deal_id: int, db: Session = Depends(get_db)):
    """
    Get timeline events for a deal.

    Returns timeline events ordered by date (most recent first).
    """
    # Verify deal exists
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found"
        )

    timeline = DealService.get_deal_timeline(db, deal_id)
    return timeline


@router.get("/{deal_id}/memory", response_model=MemoryListResponse)
def get_deal_memory(deal_id: int, db: Session = Depends(get_db)):
    """
    Get memories for a deal.

    Returns memories in the format expected by API_CONTRACT.md:
    {"memories": [...]}
    """
    # Verify deal exists
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal with id {deal_id} not found"
        )

    memories = DealService.get_deal_memories(db, deal_id)
    return {"memories": memories}
