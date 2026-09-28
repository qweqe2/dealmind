"""
Seed script for DealMind development database.

This script populates the database with realistic test data:
- 3 deals (matching frontend demo data)
- Timeline events for each deal
- Memories for each deal

Usage:
    python seed_db.py

WARNING: This will delete all existing data and recreate it.
Only use in development environments.
"""

from datetime import date, datetime
from decimal import Decimal
from app.core.database import SessionLocal, init_db
from app.models import Deal, Timeline, Memory


def clear_database(db):
    """Remove all existing data."""
    print("Clearing existing data...")
    db.query(Memory).delete()
    db.query(Timeline).delete()
    db.query(Deal).delete()
    db.commit()
    print("Database cleared")


def create_deals(db):
    """Create seed deals."""
    print("\nCreating deals...")

    deals_data = [
        {
            "company": "Orion Health",
            "deal_name": "Clinical Insights Platform",
            "stage": "Security review",
            "status": "needs_attention",
            "value": Decimal("185000"),
            "currency": "USD",
            "owner": "Tuba Tanveer",
            "contact_name": "Mira Chen",
            "contact_role": "VP of Data",
            "contact_email": "mira.chen@orionhealth.example",
            "close_date": date(2026, 10, 23),
            "last_activity": date(2026, 9, 24),
            "next_meeting": datetime(2026, 10, 2, 14, 30),
            "notes": "Security review is the remaining gate before procurement. Mira requested a clear data-retention summary and a named owner for the implementation plan.",
        },
        {
            "company": "Northstar Logistics",
            "deal_name": "Fleet Operations Suite",
            "stage": "Pilot",
            "status": "on_track",
            "value": Decimal("92000"),
            "currency": "USD",
            "owner": "Tuba Tanveer",
            "contact_name": "Rafael Ortiz",
            "contact_role": "Director of Operations",
            "contact_email": "rafael.ortiz@northstar.example",
            "close_date": date(2026, 11, 13),
            "last_activity": date(2026, 9, 25),
            "next_meeting": datetime(2026, 10, 5, 10, 0),
            "notes": "Pilot is active at two regional hubs. The operations team will share baseline dispatch metrics before the next review.",
        },
        {
            "company": "Fieldstone Bank",
            "deal_name": "Risk Analytics Modernization",
            "stage": "Negotiation",
            "status": "needs_attention",
            "value": Decimal("240000"),
            "currency": "USD",
            "owner": "Tuba Tanveer",
            "contact_name": "Priya Nair",
            "contact_role": "Chief Risk Officer",
            "contact_email": "priya.nair@fieldstone.example",
            "close_date": date(2026, 10, 30),
            "last_activity": date(2026, 9, 22),
            "next_meeting": datetime(2026, 10, 1, 11, 0),
            "notes": "The risk team supports the proposal, but finance has asked for a phased rollout and revised year-one pricing.",
        },
    ]

    created_deals = []
    for deal_data in deals_data:
        deal = Deal(**deal_data)
        db.add(deal)
        db.flush()  # Get the ID without committing
        created_deals.append(deal)
        print(f"  + Created deal #{deal.id}: {deal.company} - {deal.deal_name}")

    db.commit()
    return created_deals


def create_timeline_events(db, deals):
    """Create timeline events for deals."""
    print("\nCreating timeline events...")

    # Orion Health timeline
    orion_timeline = [
        {
            "deal_id": deals[0].id,
            "date": date(2026, 9, 24),
            "title": "Security questionnaire received",
            "type": "risk",
            "description": "Customer security team sent follow-up questions on retention and audit logs.",
        },
        {
            "deal_id": deals[0].id,
            "date": date(2026, 9, 18),
            "title": "Solution review with data team",
            "type": "meeting",
            "description": "Reviewed analytics workflows and agreed on a limited pilot scope.",
        },
        {
            "deal_id": deals[0].id,
            "date": date(2026, 9, 10),
            "title": "Commercial proposal shared",
            "type": "proposal",
            "description": "Annual subscription proposal sent to Mira and procurement.",
        },
        {
            "deal_id": deals[0].id,
            "date": date(2026, 9, 3),
            "title": "Discovery completed",
            "type": "discovery",
            "description": "Confirmed reporting delays and fragmented clinical data as core needs.",
        },
    ]

    # Northstar Logistics timeline
    northstar_timeline = [
        {
            "deal_id": deals[1].id,
            "date": date(2026, 9, 25),
            "title": "Pilot usage check-in",
            "type": "meeting",
            "description": "Two hubs confirmed active use; dispatch feedback was positive.",
        },
        {
            "deal_id": deals[1].id,
            "date": date(2026, 9, 12),
            "title": "Pilot launched",
            "type": "milestone",
            "description": "Workspace enabled for the North and Central regional teams.",
        },
        {
            "deal_id": deals[1].id,
            "date": date(2026, 9, 4),
            "title": "Pilot scope approved",
            "type": "proposal",
            "description": "Customer approved a six-week pilot across two hubs.",
        },
    ]

    # Fieldstone Bank timeline
    fieldstone_timeline = [
        {
            "deal_id": deals[2].id,
            "date": date(2026, 9, 22),
            "title": "Finance requested revised terms",
            "type": "risk",
            "description": "CFO office asked for phased pricing and a lower first-year commitment.",
        },
        {
            "deal_id": deals[2].id,
            "date": date(2026, 9, 16),
            "title": "Risk workflow validation",
            "type": "meeting",
            "description": "Analysts confirmed fit for fraud trend and portfolio monitoring workflows.",
        },
        {
            "deal_id": deals[2].id,
            "date": date(2026, 9, 8),
            "title": "Proposal review",
            "type": "proposal",
            "description": "Reviewed annual proposal with risk leadership and procurement.",
        },
    ]

    all_timeline = orion_timeline + northstar_timeline + fieldstone_timeline

    for event_data in all_timeline:
        event = Timeline(**event_data)
        db.add(event)
        print(f"  + Created timeline event: {event.title}")

    db.commit()


def create_memories(db, deals):
    """Create memories for deals."""
    print("\nCreating memories...")

    # Orion Health memories
    orion_memories = [
        {
            "deal_id": deals[0].id,
            "content": "Data cannot leave the approved US hosting region.",
            "source": "Solution review, Sep 18",
        },
        {
            "deal_id": deals[0].id,
            "content": "The CFO wants a measurable reduction in analyst reporting time before approving expansion.",
            "source": "Discovery, Sep 3",
        },
    ]

    # Northstar Logistics memories
    northstar_memories = [
        {
            "deal_id": deals[1].id,
            "content": "Dispatch managers want mobile access during shift handoffs.",
            "source": "Pilot kickoff, Sep 12",
        },
        {
            "deal_id": deals[1].id,
            "content": "Success will be measured by fewer manual dispatch corrections.",
            "source": "Pilot scope, Sep 4",
        },
    ]

    # Fieldstone Bank memories
    fieldstone_memories = [
        {
            "deal_id": deals[2].id,
            "content": "CFO approval depends on phasing costs across two budget periods.",
            "source": "Commercial review, Sep 22",
        },
        {
            "deal_id": deals[2].id,
            "content": "Risk leadership prefers a working session with finance before final approval.",
            "source": "Workflow review, Sep 16",
        },
    ]

    all_memories = orion_memories + northstar_memories + fieldstone_memories

    for memory_data in all_memories:
        memory = Memory(**memory_data)
        db.add(memory)
        print(f"  + Created memory: {memory.content[:50]}...")

    db.commit()


def main():
    """Main seed function."""
    print("=" * 60)
    print("DealMind Database Seed Script")
    print("=" * 60)

    # Initialize database tables
    print("\nInitializing database schema...")
    init_db()
    print("Database schema ready")

    # Create session
    db = SessionLocal()

    try:
        # Clear existing data
        clear_database(db)

        # Create seed data
        deals = create_deals(db)
        create_timeline_events(db, deals)
        create_memories(db, deals)

        print("\n" + "=" * 60)
        print("Seed completed successfully!")
        print("=" * 60)
        print(f"\nCreated:")
        print(f"  - {len(deals)} deals")
        print(f"  - Timeline events for each deal")
        print(f"  - Memories for each deal")
        print("\nStart the backend server to test:")
        print("     uvicorn app.main:app --reload --port 8000")

    except Exception as e:
        print(f"\nError during seeding: {e}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
