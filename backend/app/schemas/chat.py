from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000, description="User prompt or message text")
    conversation_id: Optional[str] = Field(default=None, description="Existing conversation ID or None to start new")
    project_id: Optional[str] = Field(default=None, description="Target Project ID to associate with conversation")
    mode: Optional[str] = Field(default="general", description="Creative mode: general, manga_writer, character_designer, prompt_engineer, storyboard_assistant")
    language: Optional[str] = Field(default="en", description="Language: en (English) or ta (Tamil)")
    preferred_provider: Optional[str] = Field(default=None, description="Preferred provider: gemini, openrouter, mock")
    preferred_model: Optional[str] = Field(default=None, description="Preferred model identifier")

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    provider_used: Optional[str] = None
    model_used: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    title: str
    mode: str
    language: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationDetailResponse(ConversationResponse):
    messages: List[ChatMessageResponse] = []

class ProviderTestRequest(BaseModel):
    provider_name: str = Field(..., description="Provider to test: gemini, openrouter, mock")
    model: Optional[str] = Field(default=None, description="Optional model to test")

class ProviderTestResponse(BaseModel):
    success: bool
    provider: str
    model: Optional[str] = None
    latency_ms: int = 0
    message: str
    retryable: Optional[bool] = False

class AIStatusResponse(BaseModel):
    active_text_provider: str
    is_healthy: bool
    configured_providers: List[str]
    fallback_available: bool

