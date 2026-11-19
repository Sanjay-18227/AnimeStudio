import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.config import settings
from app.services.providers.gemini import GeminiTextProvider
from app.services.providers.openrouter import OpenRouterTextProvider

def test_keys():
    print("==================================================")
    print("Testing Configured Keys:")
    print("Gemini Key:", settings.GEMINI_API_KEY[:10] + "..." if settings.GEMINI_API_KEY else "None")
    print("OpenRouter Key:", settings.OPENROUTER_API_KEY[:10] + "..." if settings.OPENROUTER_API_KEY else "None")
    print("==================================================")

    # 1. Test OpenRouter
    print("\n--- 1. Testing OpenRouter API ---")
    openrouter = OpenRouterTextProvider()
    or_result = openrouter.test_connection()
    print("OpenRouter Test Result:", or_result)

    # 2. Test Gemini
    print("\n--- 2. Testing Google Gemini API ---")
    gemini = GeminiTextProvider()
    gem_result = gemini.test_connection()
    print("Gemini Test Result:", gem_result)

if __name__ == "__main__":
    test_keys()
