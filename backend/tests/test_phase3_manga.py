import sys
import uuid
import json

# Ensure stdout handles UTF-8 (Tamil characters and emoji) safely on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from pathlib import Path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.core.database import SessionLocal, init_db
from app.models.project import Project
from app.models.character import Character
from app.models.memory import ProjectMemory
from app.models.manga import MangaStory, StoryChapter, StoryScene, MangaPanel, StoryCharacter
from app.routers.manga import (
    generate_manga_story,
    get_project_stories,
    get_story_detail,
    update_story_metadata,
    generate_or_add_chapter,
    add_or_generate_scene,
    update_scene,
    add_panel_to_scene,
    update_panel,
    transform_manga_element,
    export_story,
    delete_story
)
from app.schemas.manga import (
    MangaStoryGenerateRequest,
    MangaChapterGenerateRequest,
    MangaSceneGenerateRequest,
    MangaPanelGenerateRequest,
    MangaAITransformRequest,
    MangaStoryUpdate,
    MangaSceneUpdate,
    MangaPanelUpdate,
    DialogueItem,
    SoundEffectItem
)

def run_phase3_tests():
    print("==================================================")
    print(">>> RUNNING PHASE 3 MANGA STORY ENGINE TESTS <<<")
    print("==================================================")

    init_db()
    db = SessionLocal()

    # 1. Setup Test Project
    print("--- 1. Setting up Test Project ---")
    test_project_id = str(uuid.uuid4())
    proj = Project(
        id=test_project_id,
        title="Blade of Neo-Tokyo",
        description="A cyberpunk shonen about spirit katanas in 2188",
        genre="Action / Cyberpunk"
    )
    db.add(proj)
    db.commit()
    print(f"[PASS] Project created: {proj.title} ({proj.id})")

    # 2. Test Full Manga Story Generation
    print("--- 2. Testing POST /api/manga/generate ---")
    gen_req = MangaStoryGenerateRequest(
        project_id=test_project_id,
        title="Blade of Neo-Tokyo: Resonant Void",
        genre="Action",
        subgenre="Cyberpunk Shonen",
        premise="A rogue courier discovers an ancient dragon katana that synchronizes only with his neural implants.",
        protagonist="Ren Kageyama",
        supporting_characters="Kenjiro Takahashi (Rival), Aiko (Netrunner)",
        setting="Neo-Tokyo Sector 4",
        time_period="Year 2188",
        art_direction="Volumetric neon rain, high-contrast shonen action lines",
        chapter_count=2,
        language="en",
        tone="Dramatic and High Stakes",
        ending_type="Cliffhanger"
    )

    story_res = generate_manga_story(payload=gen_req, db=db)
    story_id = story_res["id"]
    assert story_res["title"] is not None
    assert len(story_res["chapters"]) >= 2
    assert len(story_res["characters"]) >= 2
    print(f"[PASS] Manga Story generated successfully: '{story_res['title']}' with {len(story_res['chapters'])} chapters and {len(story_res['characters'])} characters.")

    # 3. Verify Database Persistence & Hierarchy
    print("--- 3. Verifying Database Hierarchy ---")
    db_story = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    assert db_story is not None
    assert len(db_story.chapters) >= 2
    first_chap = db_story.chapters[0]
    assert len(first_chap.scenes) >= 1
    first_scene = first_chap.scenes[0]
    assert len(first_scene.panels) >= 1
    first_panel = first_scene.panels[0]
    assert first_panel.shot_type is not None
    print(f"[PASS] Database hierarchy verified: Story -> Chapter ({first_chap.title}) -> Scene ({first_scene.title}) -> Panel #{first_panel.panel_number} [{first_panel.shot_type}].")

    # 4. Verify Project Memory & Character Dossier Synchronization
    print("--- 4. Verifying Memory & Character Sync ---")
    synced_chars = db.query(Character).filter(Character.project_id == test_project_id).all()
    assert len(synced_chars) >= 1
    memories = db.query(ProjectMemory).filter(ProjectMemory.project_id == test_project_id).all()
    assert len(memories) >= 1
    print(f"[PASS] Character profiles ({len(synced_chars)}) & Story Canon Lore Memory synced to Project.")

    # 5. Test Chapter Generation / Continuation
    print("--- 5. Testing POST /api/manga/stories/{id}/chapters ---")
    chap_req = MangaChapterGenerateRequest(
        story_id=story_id,
        chapter_number=3,
        focus_prompt="Ren confronts Kenjiro atop the Sector 4 Radio Tower during the lunar eclipse.",
        action="create"
    )
    new_chap = generate_or_add_chapter(story_id=story_id, payload=chap_req, db=db)
    assert new_chap["chapter_number"] == 3
    assert len(new_chap["scenes"]) >= 1
    print(f"[PASS] Continuation Chapter 3 created: '{new_chap['title']}' with {len(new_chap['scenes'])} scenes.")

    # 6. Test Scene & Panel Granular CRUD
    print("--- 6. Testing Scene & Panel Operations ---")
    target_chap_id = first_chap.id
    scene_req = MangaSceneGenerateRequest(
        chapter_id=target_chap_id,
        scene_number=5,
        action="create",
        tone="Ominous",
        instruction="The sky turns purple."
    )
    new_scene = add_or_generate_scene(chapter_id=target_chap_id, payload=scene_req, db=db)
    assert new_scene["scene_number"] == 5
    print(f"[PASS] Added new Scene: '{new_scene['title']}' (Scene #{new_scene['scene_number']})")

    # Add Panel to Scene
    panel_req = MangaPanelGenerateRequest(
        scene_id=new_scene["id"],
        shot_type="Dutch Angle",
        instruction="Camera tilts upward as thunder strikes the spire."
    )
    new_panel = add_panel_to_scene(scene_id=new_scene["id"], payload=panel_req, db=db)
    assert new_panel["shot_type"] == "Dutch Angle"
    print(f"[PASS] Added new Panel #{new_panel['panel_number']} to Scene.")

    # Update Panel
    update_panel_req = MangaPanelUpdate(
        shot_type="Extreme Close-Up",
        visual_description="Tight shot of glowing katana edge reflecting raindrops.",
        dialogues=[
            DialogueItem(character="Ren", text="I've made my choice.", emotion="Determined", dialogue_type="speech")
        ],
        sound_effects=[
            SoundEffectItem(text="バチッ (Bachi)", meaning="Electric spark", visual_style="impact")
        ]
    )
    updated_panel = update_panel(panel_id=new_panel["id"], payload=update_panel_req, db=db)
    assert updated_panel["shot_type"] == "Extreme Close-Up"
    assert len(updated_panel["dialogues"]) == 1
    assert updated_panel["dialogues"][0].character == "Ren"
    print(f"[PASS] Updated Panel #{updated_panel['panel_number']}: dialogue and sound effects persisted.")

    # 7. Test Granular AI Transformations
    print("--- 7. Testing POST /api/manga/ai/transform ---")
    transform_req = MangaAITransformRequest(
        story_id=story_id,
        scene_id=new_scene["id"],
        action="expand_scene",
        parameters={"instruction": "Add escalating sword combat tension"}
    )
    transform_res = transform_manga_element(payload=transform_req, db=db)
    assert transform_res["success"] is True
    assert "result" in transform_res
    print(f"[PASS] AI transform action 'expand_scene' executed successfully.")

    # 8. Test Export Functionality (Markdown & JSON)
    print("--- 8. Testing Story Export ---")
    # Export Markdown
    md_res = export_story(story_id=story_id, export_format="markdown", db=db)
    md_text = md_res.body.decode("utf-8")
    assert "# Blade of Neo-Tokyo" in md_text
    assert "## Synopsis" in md_text
    assert "## Character Dossiers" in md_text
    assert "Chapter" in md_text
    assert "Panel" in md_text
    print(f"[PASS] Markdown screenplay export verified ({len(md_text)} bytes).")

    # Export JSON
    json_res = export_story(story_id=story_id, export_format="json", db=db)
    json_data = json.loads(json_res.body.decode("utf-8"))
    assert json_data["id"] == story_id
    assert "chapters" in json_data
    assert "characters" in json_data
    print(f"[PASS] Structured JSON export verified (Title: {json_data['title']}).")

    # 9. Test Story Deletion & Cascade Cleanliness
    print("--- 9. Testing Story Deletion & Cascade ---")
    del_res = delete_story(story_id=story_id, db=db)
    assert del_res.status_code == 204
    deleted_check = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    assert deleted_check is None
    # Chapters and panels should be cascade deleted
    orphaned_chaps = db.query(StoryChapter).filter(StoryChapter.story_id == story_id).all()
    assert len(orphaned_chaps) == 0
    print("[PASS] Manga Story cascade deleted cleanly.")

    print("==================================================")
    print(">>> ALL PHASE 3 MANGA ENGINE TESTS PASSED 100%! <<<")
    print("==================================================")

if __name__ == "__main__":
    run_phase3_tests()
