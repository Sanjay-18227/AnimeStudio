from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ProjectMemoryBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=100, description="Memory label/topic, e.g. 'Magic System'")
    content: str = Field(..., min_length=1, description="Memory details/lore rules to remember")
    category: Optional[str] = Field(default="lore", description="lore, character, plot, rule, custom")

class ProjectMemoryCreate(ProjectMemoryBase):
    pass

class ProjectMemoryUpdate(BaseModel):
    key: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class ProjectMemoryResponse(ProjectMemoryBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

