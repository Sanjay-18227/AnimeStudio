from typing import Dict, Any
from pydantic import BaseModel, Field

class ProviderStatus(BaseModel):
    name: str
    category: str
    is_configured: bool
    is_free_tier: bool
    active_model: str
    description: str

class SystemHealthResponse(BaseModel):
    status: str = Field(..., description="Overall system status: healthy, degraded, or offline")
    version: str = "1.0.0"
    app_name: str = "Anime Studio AI"
    environment: str
    database: str
    storage_ready: bool
    providers: Dict[str, ProviderStatus]
    system_info: Dict[str, Any]

