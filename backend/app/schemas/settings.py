from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserSettingsBase(BaseModel):
    assistant_name: str = Field(default="Anime Studio AI", max_length=100)
    personality: str = Field(default="friendly")  # friendly, professional, creative, casual, enthusiastic
    response_tone: str = Field(default="encouraging")
    response_length: str = Field(default="balanced")  # short, balanced, detailed
    language: str = Field(default="en")  # en, ta, ja
    creativity_level: str = Field(default="balanced")  # low, balanced, high
    default_role: str = Field(default="general")  # general, manga_writer, anime_artist, character_designer, storyteller
    theme: str = Field(default="dark")  # dark, light, system
    memory_enabled: bool = Field(default=True)
    voice_enabled: bool = Field(default=True)
    auto_speak_responses: bool = Field(default=False)
    voice_speed: float = Field(default=1.0, ge=0.5, le=2.0)

class UserSettingsUpdate(BaseModel):
    assistant_name: Optional[str] = None
    personality: Optional[str] = None
    response_tone: Optional[str] = None
    response_length: Optional[str] = None
    language: Optional[str] = None
    creativity_level: Optional[str] = None
    default_role: Optional[str] = None
    theme: Optional[str] = None
    memory_enabled: Optional[bool] = None
    voice_enabled: Optional[bool] = None
    auto_speak_responses: Optional[bool] = None
    voice_speed: Optional[float] = None

class UserSettingsResponse(UserSettingsBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True

