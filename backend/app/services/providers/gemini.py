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

class GeminiTextProvider(TextProvider):
    """Google Gemini API Text Provider with free tier models (1.5 Flash, 2.0 Flash)."""

    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self._api_key = api_key or settings.GEMINI_API_KEY
        self.default_model = default_model or settings.DEFAULT_GEMINI_MODEL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    def _get_api_key(self) -> str:
        key = self._api_key or settings.GEMINI_API_KEY
        if not key or not key.strip():
            raise AIProviderAuthenticationError(
                "Google Gemini API key is missing. Please set GEMINI_API_KEY in .env.",
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

        # Build Gemini contents structure
        contents = []
        for msg in messages:
            role = "user" if msg.get("role") in ["user", "human"] else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        url = f"{self.base_url}/models/{active_model}:generateContent?key={api_key}"

        try:
            with httpx.Client(timeout=35.0) as client:
                response = client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload
                )

            if response.status_code == 200:
                data = response.json()
                try:
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                    return "No output returned from Gemini model."
                except (KeyError, IndexError) as err:
                    raise AIProviderError(f"Malformed Gemini response: {err}", provider=self.provider_name)

            elif response.status_code in [401, 403]:
                error_body = response.text
                raise AIProviderAuthenticationError(
                    f"Gemini authentication failed ({response.status_code}): Invalid or restricted API key.",
                    provider=self.provider_name,
                    status_code=response.status_code
                )
            elif response.status_code == 429:
                raise AIProviderRateLimitError(
                    "Google Gemini API quota or rate limit exceeded. Please wait or use OpenRouter fallback.",
                    provider=self.provider_name
                )
            elif response.status_code >= 500:
                raise AIProviderServiceError(
                    f"Gemini server error ({response.status_code}). Temporary service outage.",
                    provider=self.provider_name,
                    status_code=response.status_code
                )
            else:
                err_msg = response.json().get("error", {}).get("message", response.text)
                raise AIProviderError(f"Gemini request failed ({response.status_code}): {err_msg}", provider=self.provider_name, status_code=response.status_code)

        except httpx.TimeoutException:
            raise AIProviderTimeoutError("Google Gemini API request timed out after 35 seconds.", provider=self.provider_name)
        except httpx.RequestError as err:
            raise AIProviderServiceError(f"Network error connecting to Gemini API: {str(err)}", provider=self.provider_name)

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
                "message": "Google Gemini API connection successful!"
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
