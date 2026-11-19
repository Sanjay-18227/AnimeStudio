from app.routers.health import router as health_router
from app.routers.projects import router as projects_router
from app.routers.ai import router as ai_router
from app.routers.chat import router as chat_router

__all__ = [
    "health_router",
    "projects_router",
    "ai_router",
    "chat_router"
]
