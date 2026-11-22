from datetime import datetime
from sqlalchemy import String, Text, DateTime, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default="default_user")
    assistant_name: Mapped[str] = mapped_column(String(100), default="Anime Studio AI")
    personality: Mapped[str] = mapped_column(String(50), default="friendly")  # friendly, professional, creative, casual, enthusiastic
    response_tone: Mapped[str] = mapped_column(String(50), default="encouraging")
    response_length: Mapped[str] = mapped_column(String(50), default="balanced")  # short, balanced, detailed
    language: Mapped[str] = mapped_column(String(20), default="en")  # en, ta, ja
    creativity_level: Mapped[str] = mapped_column(String(20), default="balanced")  # low, balanced, high
    default_role: Mapped[str] = mapped_column(String(50), default="general")  # general, manga_writer, anime_artist, character_designer, storyteller
    theme: Mapped[str] = mapped_column(String(20), default="dark")  # dark, light, system
    memory_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    voice_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_speak_responses: Mapped[bool] = mapped_column(Boolean, default=False)
    voice_speed: Mapped[float] = mapped_column(Float, default=1.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
