from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.schemas.chat import ProviderTestRequest, ProviderTestResponse, AIStatusResponse
from app.services.providers.manager import ai_manager

router = APIRouter(prefix="/ai", tags=["AI Providers"])

@router.get("/providers")
def get_providers():
    """List all AI provider adapters, their free tier metadata, available models, and masked keys."""
    return ai_manager.list_providers()

@router.get("/status", response_model=AIStatusResponse)
def get_ai_status():
    """Check health and fallback readiness of active text generation engine."""
    configured = []
    if ai_manager.gemini_provider.is_configured:
        configured.append("gemini")
    if ai_manager.openrouter_provider.is_configured:
        configured.append("openrouter")
    configured.append("mock")

    return AIStatusResponse(
        active_text_provider=settings.ACTIVE_TEXT_PROVIDER,
        is_healthy=True,
        configured_providers=configured,
        fallback_available=len(configured) > 1
    )

@router.post("/test", response_model=ProviderTestResponse)
def test_provider_connection(payload: ProviderTestRequest):
    """Diagnostically test an AI provider connection."""
    result = ai_manager.test_provider(payload.provider_name, model=payload.model)
    return ProviderTestResponse(
        success=result.get("success", False),
        provider=result.get("provider", payload.provider_name),
        model=result.get("model"),
        latency_ms=result.get("latency_ms", 0),
        message=result.get("message", ""),
        retryable=result.get("retryable", False)
    )
