import uuid
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.project import Project
from app.models.character import Character
from app.models.memory import ProjectMemory
from app.models.settings import UserSettings
from app.models.manga import MangaStory, StoryCharacter, StoryChapter, StoryScene, MangaPanel
from app.schemas.manga import (
    MangaStoryGenerateRequest,
    MangaChapterGenerateRequest,
    MangaSceneGenerateRequest,
    MangaPanelGenerateRequest,
    MangaAITransformRequest,
    MangaStoryUpdate,
    MangaChapterUpdate,
    MangaSceneUpdate,
    MangaPanelUpdate,
    MangaStoryResponse,
    MangaChapterResponse,
    MangaSceneResponse,
    MangaPanelResponse,
    DialogueItem,
    SoundEffectItem
)
from app.services.manga.engine import manga_engine

router = APIRouter(prefix="/manga", tags=["Manga Studio"])

def serialize_story(story: MangaStory) -> Dict[str, Any]:
    """Helper to cleanly serialize a MangaStory and its nested hierarchy for API response."""
    characters = []
    for c in story.characters:
        characters.append({
            "id": c.id,
            "story_id": c.story_id,
            "project_id": c.project_id,
            "name": c.name,
            "role": c.role or "Protagonist",
            "age": c.age or "",
            "appearance": c.appearance or "",
            "hair": c.hair or "",
            "eye_color": c.eye_color or "",
            "clothing": c.clothing or "",
            "body_type": c.body_type or "",
            "personality": c.personality or "",
            "abilities": c.abilities or "",
            "relationships": c.relationships_desc or "",
            "visual_prompt": c.visual_prompt or "",
            "reference_image_url": c.reference_image_url or "",
            "created_at": c.created_at
        })

    chapters = []
    for chap in story.chapters:
        scenes = []
        for sc in chap.scenes:
            panels = []
            for p in sc.panels:
                # Parse dialogues and sound effects from JSON strings
                dlgs = []
                try:
                    if p.dialogues:
                        raw_d = json.loads(p.dialogues) if isinstance(p.dialogues, str) else p.dialogues
                        dlgs = [DialogueItem(**d) for d in raw_d]
                except Exception:
                    pass

                sfxs = []
                try:
                    if p.sound_effects:
                        raw_s = json.loads(p.sound_effects) if isinstance(p.sound_effects, str) else p.sound_effects
                        sfxs = [SoundEffectItem(**s) for s in raw_s]
                except Exception:
                    pass

                panels.append({
                    "id": p.id,
                    "chapter_id": p.chapter_id,
                    "scene_id": p.scene_id,
                    "panel_number": p.panel_number,
                    "shot_type": p.shot_type or "Medium Shot",
                    "camera_angle": p.camera_angle or "Eye Level",
                    "visual_description": p.visual_description or p.scene_description or "",
                    "dialogues": dlgs,
                    "sound_effects": sfxs,
                    "narration": p.narration or "",
                    "emotion": p.emotion or "Neutral",
                    "visual_prompt": p.visual_prompt or "",
                    "image_url": p.image_url or "",
                    "page_number": p.page_number or 1,
                    "grid_position": p.grid_position or "top-left",
                    "created_at": p.created_at
                })

            scenes.append({
                "id": sc.id,
                "chapter_id": sc.chapter_id,
                "scene_number": sc.scene_number,
                "title": sc.title,
                "location": sc.location or "",
                "time_of_day": sc.time_of_day or "Day",
                "description": sc.description or "",
                "mood": sc.mood or "Dramatic",
                "visual_prompt": sc.visual_prompt or "",
                "panels": panels,
                "created_at": sc.created_at
            })

        chapters.append({
            "id": chap.id,
            "story_id": chap.story_id,
            "chapter_number": chap.chapter_number,
            "title": chap.title,
            "summary": chap.summary or "",
            "script": chap.script or "",
            "cliffhanger": chap.cliffhanger or "",
            "scenes": scenes,
            "created_at": chap.created_at,
            "updated_at": chap.updated_at
        })

    return {
        "id": story.id,
        "project_id": story.project_id,
        "title": story.title,
        "genre": story.genre,
        "subgenre": story.subgenre or "",
        "premise": story.premise or "",
        "logline": story.logline or "",
        "synopsis": story.synopsis or "",
        "world_building": story.world_building or "",
        "setting": story.setting or "",
        "time_period": story.time_period or "",
        "art_direction": story.art_direction or "",
        "target_audience": story.target_audience or "Shonen",
        "language": story.language or "en",
        "tone": story.tone or "Dramatic",
        "ending_type": story.ending_type or "Epic",
        "main_conflict": story.main_conflict or "",
        "story_arcs": story.story_arcs or "",
        "characters": characters,
        "chapters": chapters,
        "created_at": story.created_at,
        "updated_at": story.updated_at
    }


# ========================================================
# 1. Full Story Generation & Retrieval
# ========================================================

@router.post("/generate", response_model=MangaStoryResponse, status_code=status.HTTP_201_CREATED)
def generate_manga_story(payload: MangaStoryGenerateRequest, db: Session = Depends(get_db)):
    """Generates an original multi-chapter manga story screenplay from user ideas and persists it to database."""
    # 1. Verify project exists
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with ID '{payload.project_id}' not found")

    # 2. Fetch project context, lore memories, and user preferences
    memories = db.query(ProjectMemory).filter(ProjectMemory.project_id == payload.project_id).all()
    memories_list = [{"key": m.key, "content": m.content, "category": m.category} for m in memories]

    user_settings = db.query(UserSettings).first()
    user_settings_dict = {}
    if user_settings:
        user_settings_dict = {
            "assistant_name": user_settings.assistant_name,
            "personality": user_settings.personality,
            "language": user_settings.language,
            "creativity_level": user_settings.creativity_level,
            "response_tone": user_settings.response_tone
        }

    project_context = {
        "title": project.title,
        "genre": project.genre,
        "description": project.description
    }

    # 3. Invoke Manga Engine
    script = manga_engine.generate_full_story(
        request=payload,
        project_context=project_context,
        memories=memories_list,
        user_settings=user_settings_dict
    )

    # 4. Persist to Database
    story_id = str(uuid.uuid4())
    genre_str = ", ".join(script.genre) if isinstance(script.genre, list) else str(script.genre)

    db_story = MangaStory(
        id=story_id,
        project_id=payload.project_id,
        title=payload.title.strip() if (payload.title and payload.title.strip()) else script.title,
        genre=genre_str,
        subgenre=script.subgenre or payload.subgenre or "",
        premise=script.premise or payload.premise,
        logline=script.synopsis[:250] if script.synopsis else "",
        synopsis=script.synopsis,
        world_building=script.world_building or "",
        setting=script.setting or payload.setting or "",
        time_period=script.time_period or payload.time_period or "",
        art_direction=script.art_direction or payload.art_direction or "",
        target_audience=script.target_audience or payload.target_audience or "Shonen",
        language=script.language or payload.language or "en",
        tone=script.tone or payload.tone or "Dramatic",
        ending_type=script.ending_type or payload.ending_type or "Epic",
        main_conflict=script.main_conflict or "",
        story_arcs=script.story_arcs or ""
    )
    db.add(db_story)

    # 5. Persist Characters & Link with Project Character Studio
    for char_data in script.characters:
        char_id = str(uuid.uuid4())
        story_char = StoryCharacter(
            id=char_id,
            story_id=story_id,
            project_id=payload.project_id,
            name=char_data.name,
            role=char_data.role or "Protagonist",
            age=char_data.age or "",
            appearance=char_data.appearance or "",
            hair=char_data.hair or "",
            eye_color=char_data.eye_color or "",
            clothing=char_data.clothing or "",
            body_type=char_data.body_type or "",
            personality=char_data.personality or "",
            abilities=char_data.abilities or "",
            relationships_desc=char_data.relationships or "",
            visual_prompt=char_data.visual_prompt or ""
        )
        db.add(story_char)

        # Sync to general Project Character dossier if not existing
        existing_char = db.query(Character).filter(
            Character.project_id == payload.project_id,
            Character.name == char_data.name
        ).first()
        if not existing_char:
            db.add(Character(
                id=str(uuid.uuid4()),
                project_id=payload.project_id,
                name=char_data.name,
                role=char_data.role or "Protagonist",
                age=char_data.age or "",
                appearance=char_data.appearance or "",
                hairstyle=char_data.hair or "",
                clothing=char_data.clothing or "",
                personality=char_data.personality or "",
                abilities=char_data.abilities or "",
                visual_prompt=char_data.visual_prompt or ""
            ))

    # 6. Persist Chapters, Scenes, Panels
    for chap_data in script.chapters:
        chap_id = str(uuid.uuid4())
        db_chapter = StoryChapter(
            id=chap_id,
            story_id=story_id,
            chapter_number=chap_data.chapter_number,
            title=chap_data.title,
            summary=chap_data.summary or "",
            script=chap_data.script or "",
            cliffhanger=chap_data.cliffhanger or ""
        )
        db.add(db_chapter)

        for sc_data in chap_data.scenes:
            scene_id = str(uuid.uuid4())
            db_scene = StoryScene(
                id=scene_id,
                chapter_id=chap_id,
                scene_number=sc_data.scene_number,
                title=sc_data.title,
                location=sc_data.location or "",
                time_of_day=sc_data.time_of_day or "Day",
                description=sc_data.description or "",
                mood=sc_data.mood or "Dramatic",
                visual_prompt=sc_data.visual_prompt or ""
            )
            db.add(db_scene)

            for p_data in sc_data.panels:
                panel_id = str(uuid.uuid4())
                dialogues_json = json.dumps([d.model_dump() for d in p_data.dialogues], ensure_ascii=False)
                sfx_json = json.dumps([s.model_dump() for s in p_data.sound_effects], ensure_ascii=False)

                db_panel = MangaPanel(
                    id=panel_id,
                    chapter_id=chap_id,
                    scene_id=scene_id,
                    panel_number=p_data.panel_number,
                    shot_type=p_data.shot_type or "Medium Shot",
                    camera_angle=p_data.camera_angle or "Eye Level",
                    visual_description=p_data.visual_description,
                    scene_description=p_data.visual_description,
                    dialogues=dialogues_json,
                    dialogue=p_data.dialogues[0].text if p_data.dialogues else "",
                    sound_effects=sfx_json,
                    narration=p_data.narration or "",
                    emotion=p_data.emotion or "Neutral",
                    visual_prompt=p_data.visual_prompt or "",
                    page_number=p_data.page_number or 1,
                    grid_position=p_data.grid_position or "top-left"
                )
                db.add(db_panel)

    # 7. Auto-register story premise as a ProjectMemory for narrative continuity
    db.add(ProjectMemory(
        id=str(uuid.uuid4()),
        project_id=payload.project_id,
        key=f"manga_canon_{script.title[:30].replace(' ', '_').lower()}",
        content=f"Story '{script.title}': {script.synopsis[:300]}",
        category="lore"
    ))

    db.commit()
    db.refresh(db_story)

    return serialize_story(db_story)


@router.get("/projects/{project_id}/stories", response_model=List[MangaStoryResponse])
def get_project_stories(project_id: str, db: Session = Depends(get_db)):
    """List all manga stories created in a specific project."""
    stories = db.query(MangaStory).filter(MangaStory.project_id == project_id).order_by(MangaStory.updated_at.desc()).all()
    return [serialize_story(s) for s in stories]


@router.get("/stories/{story_id}", response_model=MangaStoryResponse)
def get_story_detail(story_id: str, db: Session = Depends(get_db)):
    """Get full hierarchical detail for a manga story."""
    story = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manga story not found")
    return serialize_story(story)


@router.put("/stories/{story_id}", response_model=MangaStoryResponse)
def update_story_metadata(story_id: str, payload: MangaStoryUpdate, db: Session = Depends(get_db)):
    """Update high-level story metadata."""
    story = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manga story not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if hasattr(story, field) and val is not None:
            setattr(story, field, val)

    db.commit()
    db.refresh(story)
    return serialize_story(story)


@router.delete("/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(story_id: str, db: Session = Depends(get_db)):
    """Delete a manga story and its cascade."""
    story = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manga story not found")
    db.delete(story)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ========================================================
# 2. Chapter Operations & Generation
# ========================================================

@router.post("/stories/{story_id}/chapters", response_model=MangaChapterResponse, status_code=status.HTTP_201_CREATED)
def generate_or_add_chapter(story_id: str, payload: MangaChapterGenerateRequest, db: Session = Depends(get_db)):
    """Generates a continuation chapter or rewrites an existing chapter using AI."""
    story = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manga story not found")

    # Determine chapter number
    if payload.chapter_number is not None:
        target_num = payload.chapter_number
    else:
        max_num = db.query(func.max(StoryChapter.chapter_number)).filter(StoryChapter.story_id == story_id).scalar() or 0
        target_num = max_num + 1

    # Fetch context
    story_dict = serialize_story(story)
    memories = db.query(ProjectMemory).filter(ProjectMemory.project_id == story.project_id).all()
    memories_list = [{"key": m.key, "content": m.content, "category": m.category} for m in memories]

    # Generate via Manga Engine
    chap_script = manga_engine.generate_chapter(
        story_context=story_dict,
        chapter_number=target_num,
        focus_prompt=payload.focus_prompt or "",
        action=payload.action or "create",
        memories=memories_list
    )

    # If rewriting existing chapter, delete existing scenes/panels first
    existing_chap = db.query(StoryChapter).filter(
        StoryChapter.story_id == story_id,
        StoryChapter.chapter_number == target_num
    ).first()

    chap_id = existing_chap.id if existing_chap else str(uuid.uuid4())

    if existing_chap:
        existing_chap.title = chap_script.title
        existing_chap.summary = chap_script.summary
        existing_chap.cliffhanger = chap_script.cliffhanger or ""
        # Remove old scenes
        for old_sc in existing_chap.scenes:
            db.delete(old_sc)
        db_chap = existing_chap
    else:
        db_chap = StoryChapter(
            id=chap_id,
            story_id=story_id,
            chapter_number=target_num,
            title=chap_script.title,
            summary=chap_script.summary,
            cliffhanger=chap_script.cliffhanger or ""
        )
        db.add(db_chap)

    db.flush()

    # Add new scenes & panels
    for sc_data in chap_script.scenes:
        scene_id = str(uuid.uuid4())
        db_scene = StoryScene(
            id=scene_id,
            chapter_id=chap_id,
            scene_number=sc_data.scene_number,
            title=sc_data.title,
            location=sc_data.location or "",
            time_of_day=sc_data.time_of_day or "Day",
            description=sc_data.description or "",
            mood=sc_data.mood or "Dramatic",
            visual_prompt=sc_data.visual_prompt or ""
        )
        db.add(db_scene)

        for p_data in sc_data.panels:
            panel_id = str(uuid.uuid4())
            dialogues_json = json.dumps([d.model_dump() for d in p_data.dialogues], ensure_ascii=False)
            sfx_json = json.dumps([s.model_dump() for s in p_data.sound_effects], ensure_ascii=False)

            db_panel = MangaPanel(
                id=panel_id,
                chapter_id=chap_id,
                scene_id=scene_id,
                panel_number=p_data.panel_number,
                shot_type=p_data.shot_type or "Medium Shot",
                camera_angle=p_data.camera_angle or "Eye Level",
                visual_description=p_data.visual_description,
                scene_description=p_data.visual_description,
                dialogues=dialogues_json,
                dialogue=p_data.dialogues[0].text if p_data.dialogues else "",
                sound_effects=sfx_json,
                narration=p_data.narration or "",
                emotion=p_data.emotion or "Neutral",
                visual_prompt=p_data.visual_prompt or "",
                page_number=p_data.page_number or 1,
                grid_position=p_data.grid_position or "top-left"
            )
            db.add(db_panel)

    db.commit()
    db.refresh(db_chap)

    # Return serialized chapter
    story_updated = serialize_story(story)
    target_chap_dict = next(c for c in story_updated["chapters"] if c["id"] == chap_id)
    return target_chap_dict


@router.put("/chapters/{chapter_id}", response_model=MangaChapterResponse)
def update_chapter(chapter_id: str, payload: MangaChapterUpdate, db: Session = Depends(get_db)):
    """Update chapter summary, title, or script."""
    chap = db.query(StoryChapter).filter(StoryChapter.id == chapter_id).first()
    if not chap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if hasattr(chap, field) and val is not None:
            setattr(chap, field, val)

    db.commit()
    db.refresh(chap)

    story = db.query(MangaStory).filter(MangaStory.id == chap.story_id).first()
    story_updated = serialize_story(story)
    return next(c for c in story_updated["chapters"] if c["id"] == chapter_id)


@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(chapter_id: str, db: Session = Depends(get_db)):
    """Delete a chapter and its cascade."""
    chap = db.query(StoryChapter).filter(StoryChapter.id == chapter_id).first()
    if not chap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    db.delete(chap)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ========================================================
# 3. Scene & Panel Operations
# ========================================================

@router.post("/chapters/{chapter_id}/scenes", response_model=MangaSceneResponse, status_code=status.HTTP_201_CREATED)
def add_or_generate_scene(chapter_id: str, payload: MangaSceneGenerateRequest, db: Session = Depends(get_db)):
    """Adds a new scene to a chapter."""
    chap = db.query(StoryChapter).filter(StoryChapter.id == chapter_id).first()
    if not chap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    max_num = db.query(func.max(StoryScene.scene_number)).filter(StoryScene.chapter_id == chapter_id).scalar() or 0
    new_num = payload.scene_number or (max_num + 1)

    scene_id = str(uuid.uuid4())
    db_scene = StoryScene(
        id=scene_id,
        chapter_id=chapter_id,
        scene_number=new_num,
        title=f"Scene {new_num}",
        location="Location TBD",
        time_of_day="Day",
        description="Scene description...",
        mood=payload.tone or "Dramatic",
        visual_prompt=""
    )
    db.add(db_scene)

    # Add default initial panel
    panel_id = str(uuid.uuid4())
    db_panel = MangaPanel(
        id=panel_id,
        chapter_id=chapter_id,
        scene_id=scene_id,
        panel_number=1,
        shot_type="Wide Shot",
        camera_angle="Eye Level",
        visual_description="Opening shot of the scene.",
        dialogues="[]",
        sound_effects="[]"
    )
    db.add(db_panel)

    db.commit()
    db.refresh(db_scene)

    story = db.query(MangaStory).filter(MangaStory.id == chap.story_id).first()
    story_updated = serialize_story(story)
    for c in story_updated["chapters"]:
        for sc in c["scenes"]:
            if sc["id"] == scene_id:
                return sc

    raise HTTPException(status_code=500, detail="Failed to locate created scene")


@router.put("/scenes/{scene_id}", response_model=MangaSceneResponse)
def update_scene(scene_id: str, payload: MangaSceneUpdate, db: Session = Depends(get_db)):
    """Update scene metadata."""
    scene = db.query(StoryScene).filter(StoryScene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if hasattr(scene, field) and val is not None:
            setattr(scene, field, val)

    db.commit()
    db.refresh(scene)

    story = db.query(MangaStory).join(StoryChapter).filter(StoryChapter.id == scene.chapter_id).first()
    story_updated = serialize_story(story)
    for c in story_updated["chapters"]:
        for sc in c["scenes"]:
            if sc["id"] == scene_id:
                return sc


@router.delete("/scenes/{scene_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scene(scene_id: str, db: Session = Depends(get_db)):
    """Delete a scene and its panels."""
    scene = db.query(StoryScene).filter(StoryScene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found")
    db.delete(scene)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/scenes/{scene_id}/panels", response_model=MangaPanelResponse, status_code=status.HTTP_201_CREATED)
def add_panel_to_scene(scene_id: str, payload: MangaPanelGenerateRequest, db: Session = Depends(get_db)):
    """Adds a new comic panel to an existing scene."""
    scene = db.query(StoryScene).filter(StoryScene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scene not found")

    max_num = db.query(func.max(MangaPanel.panel_number)).filter(MangaPanel.scene_id == scene_id).scalar() or 0
    next_num = max_num + 1

    panel_id = str(uuid.uuid4())
    db_panel = MangaPanel(
        id=panel_id,
        chapter_id=scene.chapter_id,
        scene_id=scene_id,
        panel_number=next_num,
        shot_type=payload.shot_type or "Medium Shot",
        camera_angle="Eye Level",
        visual_description=payload.instruction or "New panel artwork description...",
        dialogues="[]",
        sound_effects="[]",
        narration="",
        emotion="Neutral"
    )
    db.add(db_panel)
    db.commit()
    db.refresh(db_panel)

    return {
        "id": db_panel.id,
        "chapter_id": db_panel.chapter_id,
        "scene_id": db_panel.scene_id,
        "panel_number": db_panel.panel_number,
        "shot_type": db_panel.shot_type,
        "camera_angle": db_panel.camera_angle,
        "visual_description": db_panel.visual_description,
        "dialogues": [],
        "sound_effects": [],
        "narration": "",
        "emotion": "Neutral",
        "visual_prompt": "",
        "image_url": "",
        "page_number": 1,
        "grid_position": "top-left",
        "created_at": db_panel.created_at
    }


@router.put("/panels/{panel_id}", response_model=MangaPanelResponse)
def update_panel(panel_id: str, payload: MangaPanelUpdate, db: Session = Depends(get_db)):
    """Update an individual panel's artwork description, dialogues, sound effects, or camera angle."""
    panel = db.query(MangaPanel).filter(MangaPanel.id == panel_id).first()
    if not panel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Panel not found")

    if payload.shot_type is not None:
        panel.shot_type = payload.shot_type
    if payload.camera_angle is not None:
        panel.camera_angle = payload.camera_angle
    if payload.visual_description is not None:
        panel.visual_description = payload.visual_description
        panel.scene_description = payload.visual_description
    if payload.narration is not None:
        panel.narration = payload.narration
    if payload.emotion is not None:
        panel.emotion = payload.emotion
    if payload.visual_prompt is not None:
        panel.visual_prompt = payload.visual_prompt
    if payload.page_number is not None:
        panel.page_number = payload.page_number
    if payload.grid_position is not None:
        panel.grid_position = payload.grid_position

    if payload.dialogues is not None:
        panel.dialogues = json.dumps([d.model_dump() for d in payload.dialogues], ensure_ascii=False)
        panel.dialogue = payload.dialogues[0].text if payload.dialogues else ""

    if payload.sound_effects is not None:
        panel.sound_effects = json.dumps([s.model_dump() for s in payload.sound_effects], ensure_ascii=False)

    db.commit()
    db.refresh(panel)

    dlgs = []
    try:
        if panel.dialogues:
            dlgs = [DialogueItem(**d) for d in json.loads(panel.dialogues)]
    except Exception:
        pass

    sfxs = []
    try:
        if panel.sound_effects:
            sfxs = [SoundEffectItem(**s) for s in json.loads(panel.sound_effects)]
    except Exception:
        pass

    return {
        "id": panel.id,
        "chapter_id": panel.chapter_id,
        "scene_id": panel.scene_id,
        "panel_number": panel.panel_number,
        "shot_type": panel.shot_type,
        "camera_angle": panel.camera_angle,
        "visual_description": panel.visual_description or "",
        "dialogues": dlgs,
        "sound_effects": sfxs,
        "narration": panel.narration or "",
        "emotion": panel.emotion or "Neutral",
        "visual_prompt": panel.visual_prompt or "",
        "image_url": panel.image_url or "",
        "page_number": panel.page_number or 1,
        "grid_position": panel.grid_position or "top-left",
        "created_at": panel.created_at
    }


@router.delete("/panels/{panel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_panel(panel_id: str, db: Session = Depends(get_db)):
    """Delete a comic panel."""
    panel = db.query(MangaPanel).filter(MangaPanel.id == panel_id).first()
    if not panel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Panel not found")
    db.delete(panel)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ========================================================
# 4. Granular AI Transformations
# ========================================================

@router.post("/ai/transform")
def transform_manga_element(payload: MangaAITransformRequest, db: Session = Depends(get_db)):
    """Apply targeted AI actions without regenerating the whole story."""
    story = db.query(MangaStory).filter(MangaStory.id == payload.story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

    story_dict = serialize_story(story)

    # Determine target data
    target_data = {}
    if payload.panel_id:
        panel = db.query(MangaPanel).filter(MangaPanel.id == payload.panel_id).first()
        if panel:
            target_data = {
                "id": panel.id,
                "shot_type": panel.shot_type,
                "camera_angle": panel.camera_angle,
                "visual_description": panel.visual_description,
                "dialogues": json.loads(panel.dialogues) if panel.dialogues else [],
                "sound_effects": json.loads(panel.sound_effects) if panel.sound_effects else [],
                "narration": panel.narration
            }
    elif payload.scene_id:
        scene = db.query(StoryScene).filter(StoryScene.id == payload.scene_id).first()
        if scene:
            target_data = {
                "id": scene.id,
                "title": scene.title,
                "location": scene.location,
                "description": scene.description,
                "mood": scene.mood,
                "panels": [
                    {
                        "panel_number": p.panel_number,
                        "shot_type": p.shot_type,
                        "visual_description": p.visual_description,
                        "dialogues": json.loads(p.dialogues) if p.dialogues else [],
                        "sound_effects": json.loads(p.sound_effects) if p.sound_effects else []
                    } for p in scene.panels
                ]
            }

    transformed = manga_engine.transform_script(
        action=payload.action,
        target_data=target_data,
        parameters=payload.parameters or {},
        story_context=story_dict
    )

    # If updating panel in-place
    if payload.action == "regenerate_panel" and payload.panel_id:
        panel = db.query(MangaPanel).filter(MangaPanel.id == payload.panel_id).first()
        if panel and isinstance(transformed, dict):
            panel.shot_type = transformed.get("shot_type", panel.shot_type)
            panel.visual_description = transformed.get("visual_description", panel.visual_description)
            if "sound_effects" in transformed:
                panel.sound_effects = json.dumps(transformed["sound_effects"], ensure_ascii=False)
            db.commit()

    return {
        "action": payload.action,
        "success": True,
        "result": transformed
    }


# ========================================================
# 5. Export Story (Markdown & JSON)
# ========================================================

@router.get("/stories/{story_id}/export/{export_format}")
def export_story(story_id: str, export_format: str, db: Session = Depends(get_db)):
    """Export the manga story as JSON or publication-grade Screenplay Markdown."""
    story = db.query(MangaStory).filter(MangaStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

    story_dict = serialize_story(story)

    if export_format.lower() == "markdown" or export_format.lower() == "md":
        md_content = manga_engine.export_story_markdown(story_dict)
        return Response(
            content=md_content,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=\"{story.title.replace(' ', '_')}_script.md\""}
        )
    else:
        return Response(
            content=json.dumps(
                story_dict,
                ensure_ascii=False,
                indent=2,
                default=lambda o: o.model_dump() if hasattr(o, "model_dump") else str(o)
            ),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=\"{story.title.replace(' ', '_')}_script.json\""}
        )
