# API v1 routes
from .health import router as health_router
from .deals import router as deals_router
from .agent import router as agent_router

__all__ = ["health_router", "deals_router", "agent_router"]
