from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# ========================================================
# Script Items (Dialogue, Sound Effects, Panels, Scenes)
# ========================================================

class DialogueItem(BaseModel):
    character: str = Field(..., description="Character speaking")
    text: str = Field(..., description="Spoken dialogue line or thought")
    emotion: str = Field("Neutral", description="Emotional delivery: Determined, Angry, Shocked, Smiling, Tearful, Whisper")
    dialogue_type: str = Field("speech", description="speech, thought, shout, whisper, scream")

class SoundEffectItem(BaseModel):
    text: str = Field(..., description="Japanese or phonetic onomatopoeia, e.g. ドドド, ゴゴゴ, バキッ, BOOM")
    meaning: str = Field("", description="English meaning, e.g. Rumble, Menacing, Impact")
    visual_style: str = Field("impact", description="Visual styling: impact, ambient, action_slash, subtle")

class PanelScript(BaseModel):
    id: Optional[str] = None
    panel_number: int = 1
    shot_type: str = Field("Medium Shot", description="Wide Shot, Close-Up, Extreme Close-Up, Dutch Angle, Over the Shoulder, Splash Page, Low Angle")
    camera_angle: Optional[str] = "Eye Level"
    visual_description: str = Field(..., description="Visual scene artwork description for manga artist / image generator")
    dialogues: List[DialogueItem] = Field(default_factory=list)
    sound_effects: List[SoundEffectItem] = Field(default_factory=list)
    narration: Optional[str] = ""
    emotion: Optional[str] = "Neutral"
    visual_prompt: Optional[str] = ""
    page_number: Optional[int] = 1
    grid_position: Optional[str] = "top-left"
    image_url: Optional[str] = ""

class SceneScript(BaseModel):
    id: Optional[str] = None
    scene_number: int = 1
    title: str = Field(..., description="Scene title")
    location: str = Field(..., description="Physical location")
    time_of_day: Optional[str] = "Day"
    description: str = Field(..., description="Scene setting and narrative summary")
    mood: Optional[str] = "Dramatic"
    visual_prompt: Optional[str] = ""
    panels: List[PanelScript] = Field(default_factory=list)

class ChapterScript(BaseModel):
    id: Optional[str] = None
    chapter_number: int = 1
    title: str = Field(..., description="Chapter title")
    summary: str = Field(..., description="Summary of chapter events")
    script: Optional[str] = ""
    cliffhanger: Optional[str] = ""
    scenes: List[SceneScript] = Field(default_factory=list)

class CharacterScript(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Character name")
    role: str = Field("Protagonist", description="Protagonist, Antagonist, Mentor, Companion, Rival, Supporting")
    age: Optional[str] = ""
    appearance: Optional[str] = ""
    hair: Optional[str] = ""
    eye_color: Optional[str] = ""
    clothing: Optional[str] = ""
    body_type: Optional[str] = ""
    personality: Optional[str] = ""
    abilities: Optional[str] = ""
    relationships: Optional[str] = ""
    visual_prompt: Optional[str] = ""
    reference_image_url: Optional[str] = ""

class MangaStoryScript(BaseModel):
    title: str = Field(..., description="Story title")
    genre: Union[List[str], str] = Field(default_factory=lambda: ["Action"])
    subgenre: Optional[str] = ""
    premise: Optional[str] = ""
    synopsis: str = Field(..., description="High-level narrative synopsis")
    world_building: Optional[str] = ""
    setting: Optional[str] = ""
    time_period: Optional[str] = ""
    art_direction: Optional[str] = ""
    target_audience: Optional[str] = "Shonen"
    language: Optional[str] = "en"
    tone: Optional[str] = "Dramatic"
    ending_type: Optional[str] = "Epic"
    main_conflict: Optional[str] = ""
    story_arcs: Optional[str] = ""
    characters: List[CharacterScript] = Field(default_factory=list)
    chapters: List[ChapterScript] = Field(default_factory=list)

# ========================================================
# Request Schemas
# ========================================================

class MangaStoryGenerateRequest(BaseModel):
    project_id: str
    title: Optional[str] = ""
    genre: str = "Action"
    subgenre: Optional[str] = ""
    premise: str
    protagonist: Optional[str] = ""
    supporting_characters: Optional[str] = ""
    setting: Optional[str] = ""
    time_period: Optional[str] = ""
    art_direction: Optional[str] = ""
    target_audience: Optional[str] = "Shonen"
    chapter_count: int = Field(default=3, ge=1, le=10)
    language: str = "en"
    tone: Optional[str] = "Dramatic"
    ending_type: Optional[str] = "Epic"
    preferred_provider: Optional[str] = None
    preferred_model: Optional[str] = None

class MangaChapterGenerateRequest(BaseModel):
    story_id: str
    chapter_number: Optional[int] = None
    focus_prompt: Optional[str] = ""
    action: Optional[str] = "create"  # "create" | "rewrite" | "add_twist"

class MangaSceneGenerateRequest(BaseModel):
    chapter_id: str
    scene_number: Optional[int] = None
    action: str = "create"  # "create" | "expand" | "improve_dialogue" | "change_tone"
    tone: Optional[str] = None
    instruction: Optional[str] = ""

class MangaPanelGenerateRequest(BaseModel):
    scene_id: str
    shot_type: Optional[str] = None
    instruction: Optional[str] = ""

class MangaAITransformRequest(BaseModel):
    story_id: str
    chapter_id: Optional[str] = None
    scene_id: Optional[str] = None
    panel_id: Optional[str] = None
    action: str = Field(..., description="expand_scene, improve_dialogue, change_tone, add_twist, alternative_ending, regenerate_panel")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

# ========================================================
# Update Schemas
# ========================================================

class MangaStoryUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    subgenre: Optional[str] = None
    premise: Optional[str] = None
    synopsis: Optional[str] = None
    world_building: Optional[str] = None
    setting: Optional[str] = None
    time_period: Optional[str] = None
    art_direction: Optional[str] = None
    target_audience: Optional[str] = None
    language: Optional[str] = None
    tone: Optional[str] = None
    ending_type: Optional[str] = None
    main_conflict: Optional[str] = None
    story_arcs: Optional[str] = None

class MangaChapterUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    script: Optional[str] = None
    cliffhanger: Optional[str] = None
    chapter_number: Optional[int] = None

class MangaSceneUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    time_of_day: Optional[str] = None
    description: Optional[str] = None
    mood: Optional[str] = None
    visual_prompt: Optional[str] = None
    scene_number: Optional[int] = None

class MangaPanelUpdate(BaseModel):
    shot_type: Optional[str] = None
    camera_angle: Optional[str] = None
    visual_description: Optional[str] = None
    dialogues: Optional[List[DialogueItem]] = None
    sound_effects: Optional[List[SoundEffectItem]] = None
    narration: Optional[str] = None
    emotion: Optional[str] = None
    visual_prompt: Optional[str] = None
    page_number: Optional[int] = None
    grid_position: Optional[str] = None

# ========================================================
# Response Models
# ========================================================

class StoryCharacterResponse(BaseModel):
    id: str
    story_id: str
    project_id: Optional[str] = None
    name: str
    role: Optional[str] = "Protagonist"
    age: Optional[str] = ""
    appearance: Optional[str] = ""
    hair: Optional[str] = ""
    eye_color: Optional[str] = ""
    clothing: Optional[str] = ""
    body_type: Optional[str] = ""
    personality: Optional[str] = ""
    abilities: Optional[str] = ""
    relationships: Optional[str] = ""
    visual_prompt: Optional[str] = ""
    reference_image_url: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class MangaPanelResponse(BaseModel):
    id: str
    chapter_id: str
    scene_id: Optional[str] = None
    panel_number: int
    shot_type: str
    camera_angle: Optional[str] = "Eye Level"
    visual_description: str
    dialogues: List[DialogueItem] = []
    sound_effects: List[SoundEffectItem] = []
    narration: Optional[str] = ""
    emotion: Optional[str] = "Neutral"
    visual_prompt: Optional[str] = ""
    image_url: Optional[str] = ""
    page_number: int = 1
    grid_position: Optional[str] = "top-left"
    created_at: datetime

    class Config:
        from_attributes = True

class MangaSceneResponse(BaseModel):
    id: str
    chapter_id: str
    scene_number: int
    title: str
    location: Optional[str] = ""
    time_of_day: Optional[str] = "Day"
    description: Optional[str] = ""
    mood: Optional[str] = "Dramatic"
    visual_prompt: Optional[str] = ""
    panels: List[MangaPanelResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class MangaChapterResponse(BaseModel):
    id: str
    story_id: str
    chapter_number: int
    title: str
    summary: Optional[str] = ""
    script: Optional[str] = ""
    cliffhanger: Optional[str] = ""
    scenes: List[MangaSceneResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MangaStoryResponse(BaseModel):
    id: str
    project_id: str
    title: str
    genre: str
    subgenre: Optional[str] = ""
    premise: Optional[str] = ""
    logline: Optional[str] = ""
    synopsis: Optional[str] = ""
    world_building: Optional[str] = ""
    setting: Optional[str] = ""
    time_period: Optional[str] = ""
    art_direction: Optional[str] = ""
    target_audience: Optional[str] = "Shonen"
    language: Optional[str] = "en"
    tone: Optional[str] = "Dramatic"
    ending_type: Optional[str] = "Epic"
    main_conflict: Optional[str] = ""
    story_arcs: Optional[str] = ""
    characters: List[StoryCharacterResponse] = []
    chapters: List[MangaChapterResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
