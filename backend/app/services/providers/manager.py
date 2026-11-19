import logging
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.services.providers.base import (
    TextProvider,
    AIProviderError,
    AIProviderAuthenticationError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderServiceError,
)
from app.services.providers.gemini import GeminiTextProvider
from app.services.providers.openrouter import OpenRouterTextProvider
from app.services.providers.mock import MockTextProvider
from app.services.chat.prompts import build_system_instruction

logger = logging.getLogger("AnimeStudio.AIProviderManager")

def mask_credential(key: str) -> str:
    """Masks an API key for safe UI display (e.g. AIzaSy...1a2b)."""
    if not key or not key.strip():
        return "Not Set"
    cleaned = key.strip()
    if len(cleaned) <= 8:
        return "****"
    return f"{cleaned[:6]}...{cleaned[-4:]}"

class AIProviderManager:
    """Central provider manager coordinating AI execution, validation, testing, and intelligent fallback."""

    def __init__(self):
        self.gemini_provider = GeminiTextProvider()
        self.openrouter_provider = OpenRouterTextProvider()
        self.mock_provider = MockTextProvider()

    def get_text_provider(self, name: Optional[str] = None) -> TextProvider:
        """Resolves a provider instance by name, falling back to configured active text provider."""
        target = (name or settings.ACTIVE_TEXT_PROVIDER).lower().strip()
        if target == "gemini":
            return self.gemini_provider
        elif target == "openrouter":
            return self.openrouter_provider
        elif target == "mock":
            return self.mock_provider
        else:
            return self.gemini_provider

    def list_providers(self) -> Dict[str, Any]:
        """Returns metadata, models, and masked credential status for all supported providers."""
        return {
            "active_provider": settings.ACTIVE_TEXT_PROVIDER,
            "providers": [
                {
                    "id": "gemini",
                    "name": "Google Gemini API",
                    "category": "Text & Creative Writing",
                    "is_configured": self.gemini_provider.is_configured,
                    "masked_key": mask_credential(settings.GEMINI_API_KEY),
                    "default_model": settings.DEFAULT_GEMINI_MODEL,
                    "available_models": ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
                    "is_free_tier": True,
                    "free_tier_limits": "15 RPM / 1M TPM (Free Tier AI Studio)",
                    "documentation_url": "https://aistudio.google.com/"
                },
                {
                    "id": "openrouter",
                    "name": "OpenRouter (Free LLMs)",
                    "category": "Text & Creative Writing",
                    "is_configured": self.openrouter_provider.is_configured,
                    "masked_key": mask_credential(settings.OPENROUTER_API_KEY),
                    "default_model": settings.DEFAULT_OPENROUTER_MODEL,
                    "available_models": [
                        "meta-llama/llama-3.3-70b-instruct:free",
                        "qwen/qwen-2.5-72b-instruct:free",
                        "mistralai/mistral-7b-instruct:free"
                    ],
                    "is_free_tier": True,
                    "free_tier_limits": "Varies by open-source host, completely free tier available",
                    "documentation_url": "https://openrouter.ai/"
                },
                {
                    "id": "mock",
                    "name": "Anime Studio Offline Engine",
                    "category": "Offline Simulation & Testing",
                    "is_configured": True,
                    "masked_key": "Built-in (No key needed)",
                    "default_model": "anime-studio-local-v1",
                    "available_models": ["anime-studio-local-v1"],
                    "is_free_tier": True,
                    "free_tier_limits": "Unlimited (Local)",
                    "documentation_url": "Local built-in fallback"
                }
            ]
        }

    def test_provider(self, provider_name: str, model: Optional[str] = None) -> Dict[str, Any]:
        """Executes a diagnostic test on a specific provider."""
        provider = self.get_text_provider(provider_name)
        return provider.test_connection(model=model)

    def execute_chat(
        self,
        messages: List[Dict[str, str]],
        mode: str = "general",
        language: str = "en",
        preferred_provider: Optional[str] = None,
        preferred_model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Tuple[str, str, str, bool]:
        """Executes multi-turn chat with mode-aware system instructions and automatic fallback.
        
        Returns:
            Tuple[content: str, provider_used: str, model_used: str, fallback_triggered: bool]
        """
        system_instruction = build_system_instruction(mode=mode, language=language)

        # 1. Determine primary provider
        primary_name = (preferred_provider or settings.ACTIVE_TEXT_PROVIDER).lower().strip()
        primary_provider = self.get_text_provider(primary_name)

        # If primary provider is not configured with an API key, use fallback
        if primary_name == "gemini" and not self.gemini_provider.is_configured:
            if self.openrouter_provider.is_configured:
                logger.info("Gemini key not configured; routing to configured OpenRouter provider.")
                out = self.openrouter_provider.chat(
                    messages, system_instruction=system_instruction,
                    model=preferred_model or self.openrouter_provider.default_model,
                    temperature=temperature, max_tokens=max_tokens
                )
                return out, "openrouter", preferred_model or self.openrouter_provider.default_model, True
            else:
                logger.info("No cloud API keys configured; utilizing Anime Studio local offline engine.")
                out = self.mock_provider.chat(messages, system_instruction=system_instruction)
                return out, "mock", "offline-engine", False

        if primary_name == "openrouter" and not self.openrouter_provider.is_configured:
            if self.gemini_provider.is_configured:
                logger.info("OpenRouter key not configured; routing to configured Gemini provider.")
                out = self.gemini_provider.chat(
                    messages, system_instruction=system_instruction,
                    model=preferred_model or self.gemini_provider.default_model,
                    temperature=temperature, max_tokens=max_tokens
                )
                return out, "gemini", preferred_model or self.gemini_provider.default_model, True
            else:
                out = self.mock_provider.chat(messages, system_instruction=system_instruction)
                return out, "mock", "offline-engine", False

        if primary_name == "mock":
            out = self.mock_provider.chat(messages, system_instruction=system_instruction)
            return out, "mock", "offline-engine", False

        # 2. Try primary provider execution
        try:
            logger.info("Calling primary AI provider: %s", primary_name)
            out = primary_provider.chat(
                messages,
                system_instruction=system_instruction,
                model=preferred_model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            used_model = preferred_model or getattr(primary_provider, "default_model", "standard")
            return out, primary_name, used_model, False

        except AIProviderAuthenticationError as auth_err:
            # Permanent configuration error: DO NOT silently switch
            logger.error("Authentication error for %s: %s", primary_name, auth_err.message)
            raise auth_err

        except (AIProviderRateLimitError, AIProviderTimeoutError, AIProviderServiceError) as recov_err:
            logger.warning(
                "Recoverable error from primary provider %s (%s). Attempting fallback...",
                primary_name, recov_err.message
            )

            # Determine fallback candidate
            if primary_name == "gemini" and self.openrouter_provider.is_configured:
                try:
                    logger.info("Falling back to OpenRouter free models...")
                    fallback_model = self.openrouter_provider.default_model
                    out = self.openrouter_provider.chat(
                        messages,
                        system_instruction=system_instruction,
                        model=fallback_model,
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
                    return out, "openrouter", fallback_model, True
                except Exception as fb_err:
                    logger.error("Fallback provider OpenRouter also failed: %s", str(fb_err))

            # If all else fails and it was a recoverable error, use local mock with a notice
            logger.info("Using local mock provider as final safety net.")
            mock_out = self.mock_provider.chat(messages, system_instruction=system_instruction)
            notice = f"\n\n*(Notice: Primary provider '{primary_name}' failed ({recov_err.message}). Delivered via local backup engine.)*"
            return mock_out + notice, "mock", "offline-engine", True

# Global singleton
ai_manager = AIProviderManager()
