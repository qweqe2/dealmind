from sqlalchemy.orm import Session
from app.services.deal_service import DealService


def get_deals_needing_attention(db: Session) -> list[dict]:
    """
    Tool: Get all deals that need attention.

    Returns deals with status='needs_attention' including key details.
    """
    deals = DealService.get_deals(db)
    attention_deals = [d for d in deals if d.status == "needs_attention"]

    return [
        {
            "id": deal.id,
            "company": deal.company,
            "deal_name": deal.deal_name,
            "stage": deal.stage,
            "status": deal.status,
            "notes": deal.notes,
            "value": float(deal.value) if deal.value else None,
            "owner": deal.owner,
            "close_date": str(deal.close_date) if deal.close_date else None,
            "last_activity": str(deal.last_activity) if deal.last_activity else None,
        }
        for deal in attention_deals
    ]


def get_deal_details(db: Session, deal_id: int) -> dict:
    """
    Tool: Get detailed information about a specific deal.

    Includes deal info, timeline events, and memories.
    """
    deal = DealService.get_deal(db, deal_id)
    if not deal:
        return {"error": f"Deal {deal_id} not found"}

    timeline = DealService.get_deal_timeline(db, deal_id)
    memories = DealService.get_deal_memories(db, deal_id)

    return {
        "deal": {
            "id": deal.id,
            "company": deal.company,
            "deal_name": deal.deal_name,
            "stage": deal.stage,
            "status": deal.status,
            "value": float(deal.value) if deal.value else None,
            "owner": deal.owner,
            "contact_name": deal.contact_name,
            "contact_role": deal.contact_role,
            "close_date": str(deal.close_date) if deal.close_date else None,
            "last_activity": str(deal.last_activity) if deal.last_activity else None,
            "notes": deal.notes,
        },
        "timeline": [
            {
                "date": str(event.date),
                "title": event.title,
                "type": event.type,
                "description": event.description,
            }
            for event in timeline
        ],
        "memories": [
            {
                "content": memory.content,
                "source": memory.source,
            }
            for memory in memories
        ],
    }
