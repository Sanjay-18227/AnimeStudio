import time
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings
from app.services.providers.base import (
    TextProvider,
    AIProviderError,
    AIProviderAuthenticationError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderServiceError,
)

class OpenRouterTextProvider(TextProvider):
    """OpenRouter API Text Provider with free models (Llama 3.3 70B:free, Qwen 2.5:free, Mistral:free)."""

    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self._api_key = api_key or settings.OPENROUTER_API_KEY
        self.default_model = default_model or settings.DEFAULT_OPENROUTER_MODEL
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

    @property
    def provider_name(self) -> str:
        return "openrouter"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    def _get_api_key(self) -> str:
        key = self._api_key or settings.OPENROUTER_API_KEY
        if not key or not key.strip():
            raise AIProviderAuthenticationError(
                "OpenRouter API key is missing. Please set OPENROUTER_API_KEY in .env.",
                provider=self.provider_name
            )
        return key.strip()

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        messages = [{"role": "user", "content": prompt}]
        return self.chat(messages, system_instruction=system_instruction, model=model, temperature=temperature, max_tokens=max_tokens)

    def chat(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        api_key = self._get_api_key()
        active_model = model or self.default_model

        formatted_messages = []
        if system_instruction:
            formatted_messages.append({"role": "system", "content": system_instruction})

        for msg in messages:
            role = "assistant" if msg.get("role") in ["assistant", "model"] else "user"
            formatted_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })

        payload = {
            "model": active_model,
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Anime Studio AI",
            "Content-Type": "application/json"
        }

        try:
            with httpx.Client(timeout=35.0) as client:
                response = client.post(self.api_url, headers=headers, json=payload)

            if response.status_code == 200:
                data = response.json()
                choices = data.get("choices", [])
                if choices and "message" in choices[0]:
                    return choices[0]["message"].get("content", "")
                return "No output returned from OpenRouter model."

            elif response.status_code in [401, 403]:
                raise AIProviderAuthenticationError(
                    f"OpenRouter authentication failed ({response.status_code}): Invalid API key.",
                    provider=self.provider_name,
                    status_code=response.status_code
                )
            elif response.status_code == 429:
                raise AIProviderRateLimitError(
                    "OpenRouter free rate limit exceeded. Please wait a moment before retrying.",
                    provider=self.provider_name
                )
            elif response.status_code >= 500:
                raise AIProviderServiceError(
                    f"OpenRouter server error ({response.status_code}).",
                    provider=self.provider_name,
                    status_code=response.status_code
                )
            else:
                err_msg = response.text
                raise AIProviderError(f"OpenRouter error ({response.status_code}): {err_msg}", provider=self.provider_name, status_code=response.status_code)

        except httpx.TimeoutException:
            raise AIProviderTimeoutError("OpenRouter request timed out after 35 seconds.", provider=self.provider_name)
        except httpx.RequestError as err:
            raise AIProviderServiceError(f"Network error connecting to OpenRouter API: {str(err)}", provider=self.provider_name)

    def test_connection(self, model: Optional[str] = None) -> Dict[str, Any]:
        """Verify API key and latency with a lightweight test prompt."""
        t0 = time.time()
        active_model = model or self.default_model
        try:
            res = self.generate_text("Respond with: 'Anime Studio AI test OK'", model=active_model, max_tokens=10)
            latency = int((time.time() - t0) * 1000)
            return {
                "success": True,
                "provider": self.provider_name,
                "model": active_model,
                "latency_ms": latency,
                "message": "OpenRouter API connection successful!"
            }
        except AIProviderError as err:
            latency = int((time.time() - t0) * 1000)
            return {
                "success": False,
                "provider": self.provider_name,
                "model": active_model,
                "latency_ms": latency,
                "message": err.message,
                "retryable": err.retryable
            }
        except Exception as ex:
            return {
                "success": False,
                "provider": self.provider_name,
                "model": active_model,
                "latency_ms": int((time.time() - t0) * 1000),
                "message": str(ex),
                "retryable": False
            }
