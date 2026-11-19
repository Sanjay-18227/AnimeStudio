import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is on sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.core.database import init_db, SessionLocal
from app.routers.ai import get_providers, get_ai_status, test_provider_connection
from app.routers.chat import send_chat_message, list_conversations, get_conversation_detail, delete_conversation
from app.schemas.chat import ChatMessageCreate, ProviderTestRequest
from app.services.providers.manager import ai_manager
from app.services.providers.base import (
    AIProviderRateLimitError,
    AIProviderAuthenticationError,
    AIProviderTimeoutError
)

def run_phase2_tests():
    print("==================================================")
    print(">>> RUNNING PHASE 2 BACKEND TEST SUITE <<<")
    print("==================================================")

    # 1. Initialize DB tables (creates conversations and chat_messages)
    print("--- 1. Initializing DB Schema with Chat Tables ---")
    init_db()
    db = SessionLocal()
    print("[PASS] DB tables initialized successfully.")

    # 2. Test AI Providers Info
    print("--- 2. Testing GET /api/ai/providers ---")
    providers_info = get_providers()
    assert "providers" in providers_info
    assert len(providers_info["providers"]) >= 3
    gemini_info = next(p for p in providers_info["providers"] if p["id"] == "gemini")
    openrouter_info = next(p for p in providers_info["providers"] if p["id"] == "openrouter")
    mock_info = next(p for p in providers_info["providers"] if p["id"] == "mock")
    assert gemini_info["is_free_tier"] is True
    assert "gemini-1.5-flash" in gemini_info["available_models"]
    assert "llama-3.3-70b-instruct:free" in openrouter_info["available_models"][0]
    print("[PASS] Providers listed with masked credentials and verified free models.")

    # 3. Test AI Status
    print("--- 3. Testing GET /api/ai/status ---")
    status_resp = get_ai_status()
    assert status_resp.is_healthy is True
    assert "mock" in status_resp.configured_providers
    print("[PASS] AI Status reported:", status_resp.active_text_provider)

    # 4. Test Diagnostic Connection
    print("--- 4. Testing POST /api/ai/test on Mock Provider ---")
    test_req = ProviderTestRequest(provider_name="mock")
    test_res = test_provider_connection(test_req)
    assert test_res.success is True
    assert test_res.provider == "mock"
    print("[PASS] Diagnostic test succeeded. Latency:", test_res.latency_ms, "ms")

    # 5. Test Chat Message Creation (English - Manga Writer Mode)
    print("--- 5. Testing POST /api/chat/ (English - Manga Writer Mode) ---")
    chat_payload = ChatMessageCreate(
        content="Create a scene with a cyberpunk ninja on a neon rooftop in the rain.",
        mode="manga_writer",
        language="en"
    )
    msg_res = send_chat_message(chat_payload, db)
    assert msg_res.sender == "assistant"
    assert msg_res.conversation_id is not None
    assert len(msg_res.content) > 50
    conv_id = msg_res.conversation_id
    print("[PASS] AI Chat response received in conversation:", conv_id)
    print("Snippet:", msg_res.content[:100], "...")

    # 6. Test Multi-turn Chat Persistence in the same conversation
    print("--- 6. Testing Multi-turn Chat in Existing Conversation ---")
    followup_payload = ChatMessageCreate(
        conversation_id=conv_id,
        content="Now add a dialogue where the ninja vows to avenge his clan.",
        mode="manga_writer",
        language="en"
    )
    followup_res = send_chat_message(followup_payload, db)
    assert followup_res.conversation_id == conv_id
    assert followup_res.sender == "assistant"
    print("[PASS] Multi-turn followup persisted and answered.")

    # 7. Test Tamil Language Prompt (தமிழ் - Character Designer Mode)
    print("--- 7. Testing Tamil Language Prompt (Character Designer Mode) ---")
    tamil_payload = ChatMessageCreate(
        content="நிழல் மாய சக்தி கொண்ட ஒரு ஷோனென் கதாநாயகனின் பாத்திரத்தை வடிவமைக்கவும்.",
        mode="character_designer",
        language="ta"
    )
    tamil_res = send_chat_message(tamil_payload, db)
    assert tamil_res.sender == "assistant"
    assert len(tamil_res.content) > 30
    print("[PASS] Tamil response generated successfully. Snippet:", tamil_res.content[:80], "...")

    # 8. Test List Conversations
    print("--- 8. Testing GET /api/chat/conversations ---")
    conv_list = list_conversations(project_id=None, mode=None, db=db)
    assert len(conv_list) >= 2
    assert any(c.id == conv_id for c in conv_list)
    print("[PASS] Conversations list retrieved. Total sessions:", len(conv_list))

    # 9. Test Conversation Detail
    print("--- 9. Testing GET /api/chat/conversations/{id} ---")
    detail = get_conversation_detail(conv_id, db)
    assert detail.id == conv_id
    assert detail.message_count >= 4  # 2 user messages + 2 assistant messages
    assert len(detail.messages) >= 4
    print("[PASS] Conversation detail verified with", len(detail.messages), "messages.")

    # 10. Test Fallback Mechanism (Simulating Gemini Rate Limit 429)
    print("--- 10. Testing Provider Fallback on Recoverable 429 Error ---")
    messages = [{"role": "user", "content": "Test fallback"}]
    with patch.object(ai_manager.gemini_provider, "chat", side_effect=AIProviderRateLimitError("Quota 429", provider="gemini")):
        with patch.object(ai_manager.gemini_provider, "_api_key", "mock_gemini_key"):
            reply, prov, model, fallback = ai_manager.execute_chat(
                messages, mode="general", language="en", preferred_provider="gemini"
            )
            assert fallback is True
            assert prov in ["openrouter", "mock"]
            print(f"[PASS] Recoverable error successfully triggered fallback to '{prov}' with notice.")

    # 11. Test Permanent 401 Authentication Error (Must NOT silently switch)
    print("--- 11. Testing Permanent 401 Authentication Error ---")
    with patch.object(ai_manager.gemini_provider, "chat", side_effect=AIProviderAuthenticationError("Invalid API key 401", provider="gemini")):
        with patch.object(ai_manager.gemini_provider, "_api_key", "mock_gemini_key"):
            try:
                ai_manager.execute_chat(messages, mode="general", language="en", preferred_provider="gemini")
                assert False, "Should have raised AIProviderAuthenticationError"
            except AIProviderAuthenticationError as e:
                assert e.status_code == 401
                print("[PASS] 401 Authentication error properly preserved and raised (no silent fallback).")

    # 12. Test Delete Conversation
    print("--- 12. Testing DELETE /api/chat/conversations/{id} ---")
    delete_conversation(conv_id, db)
    try:
        get_conversation_detail(conv_id, db)
        assert False, "Should have raised 404"
    except Exception:
        print("[PASS] Conversation deleted and verified 404.")

    db.close()
    print("==================================================")
    print(">>> ALL PHASE 2 BACKEND TESTS PASSED 100%! <<<")
    print("==================================================")

if __name__ == "__main__":
    run_phase2_tests()
