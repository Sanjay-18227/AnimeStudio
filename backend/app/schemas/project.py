from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Project title")
    description: Optional[str] = Field(default="", description="High level synopsis")
    genre: Optional[str] = Field(default="Shonen", description="Anime/Manga genre")
    target_audience: Optional[str] = Field(default="General", description="Target demographic")
    cover_image_url: Optional[str] = Field(default="", description="Cover image path or URL")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    target_audience: Optional[str] = None
    cover_image_url: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    characters_count: int = 0
    chapters_count: int = 0
    images_count: int = 0
    videos_count: int = 0

    class Config:
        from_attributes = True

