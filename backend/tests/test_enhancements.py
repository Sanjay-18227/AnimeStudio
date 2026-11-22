import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.core.database import init_db, SessionLocal
from app.routers.settings import get_user_settings, update_user_settings, reset_user_settings
from app.schemas.settings import UserSettingsUpdate
from app.routers.memories import create_project_memory, list_project_memories, update_project_memory, delete_project_memory
from app.schemas.memory import ProjectMemoryCreate, ProjectMemoryUpdate
from app.routers.projects import create_project, delete_project
from app.schemas.project import ProjectCreate
from app.routers.chat import send_chat_message, regenerate_chat_response, list_conversations, get_conversation_detail
from app.schemas.chat import ChatMessageCreate

def run_tests():
    print("==================================================")
    print(">>> RUNNING ENHANCED CHAT & MEMORY TESTS <<<")
    print("==================================================")

    init_db()
    db = SessionLocal()

    # 1. Test User Settings
    print("--- 1. Testing User Settings CRUD ---")
    settings = get_user_settings(db)
    assert settings.assistant_name == "Anime Studio AI"
    assert settings.memory_enabled is True
    print("[PASS] Initial settings loaded.")

    updated = update_user_settings(UserSettingsUpdate(assistant_name="Yuki-Sensei", personality="creative", language="ja"), db)
    assert updated.assistant_name == "Yuki-Sensei"
    assert updated.personality == "creative"
    assert updated.language == "ja"
    print("[PASS] Settings updated to custom values.")

    reset = reset_user_settings(db)
    assert reset.assistant_name == "Anime Studio AI"
    assert reset.personality == "friendly"
    print("[PASS] Settings reset to factory defaults.")

    # 2. Test Project & Project Memories
    print("--- 2. Testing Project Memories CRUD ---")
    proj = create_project(ProjectCreate(title="Neo Tokyo Chrono", genre="Cyberpunk"), db)
    proj_id = proj.id

    mem1 = create_project_memory(proj_id, ProjectMemoryCreate(key="Magic Rule", content="Neon magic drains life batteries", category="rule"), db)
    assert mem1.key == "Magic Rule"
    print("[PASS] Created project memory.")

    mems = list_project_memories(proj_id, db)
    assert len(mems) == 1
    assert mems[0].key == "Magic Rule"
    print("[PASS] Listed project memories.")

    updated_mem = update_project_memory(proj_id, mem1.id, ProjectMemoryUpdate(content="Neon magic requires cyber-implants"), db)
    assert updated_mem.content == "Neon magic requires cyber-implants"
    print("[PASS] Updated project memory.")

    # 3. Test Chat with Project Memory & Continuity
    print("--- 3. Testing Chat with Project Memory ---")
    msg1 = send_chat_message(ChatMessageCreate(
        content="Tell me about the magic system in our world.",
        project_id=proj_id,
        mode="general",
        language="en"
    ), db)
    assert msg1.sender == "assistant"
    conv_id = msg1.conversation_id
    print("[PASS] Memory-aware chat completed. Snippet:", msg1.content[:80], "...")

    # 4. Test Regeneration
    print("--- 4. Testing Response Regeneration ---")
    regen_msg = regenerate_chat_response(conv_id, db)
    assert regen_msg.sender == "assistant"
    assert regen_msg.conversation_id == conv_id
    print("[PASS] Response successfully regenerated.")

    # 5. Test Search Conversations
    print("--- 5. Testing Conversation Search ---")
    search_results = list_conversations(project_id=proj_id, mode=None, search="magic", db=db)
    assert len(search_results) >= 1
    print("[PASS] Conversation search returned matching sessions.")

    # 6. Cleanup
    delete_project_memory(proj_id, mem1.id, db)
    delete_project(proj_id, db)
    db.close()

    print("==================================================")
    print(">>> ALL ENHANCEMENT BACKEND TESTS PASSED 100%! <<<")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
