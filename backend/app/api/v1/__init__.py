# API v1 module
from fastapi import APIRouter
from .routes import health_router, deals_router, agent_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(deals_router, prefix="/deals", tags=["deals"])
api_router.include_router(agent_router, prefix="/agent", tags=["agent"])

__all__ = ["api_router"]
