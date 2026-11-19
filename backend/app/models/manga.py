from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class MangaStory(Base):
    __tablename__ = "manga_stories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    logline: Mapped[str] = mapped_column(Text, default="", nullable=True)
    synopsis: Mapped[str] = mapped_column(Text, default="", nullable=True)
    themes: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    language: Mapped[str] = mapped_column(String(20), default="en", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="manga_stories")
    chapters = relationship("MangaChapter", back_populates="story", cascade="all, delete-orphan")

class MangaChapter(Base):
    __tablename__ = "manga_chapters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    story_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_stories.id", ondelete="CASCADE"), nullable=False)
    chapter_number: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="", nullable=True)
    script: Mapped[str] = mapped_column(Text, default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    story = relationship("MangaStory", back_populates="chapters")
    panels = relationship("MangaPanel", back_populates="chapter", cascade="all, delete-orphan")

class MangaPanel(Base):
    __tablename__ = "manga_panels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    chapter_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_chapters.id", ondelete="CASCADE"), nullable=False)
    panel_number: Mapped[int] = mapped_column(Integer, default=1)
    scene_description: Mapped[str] = mapped_column(Text, default="", nullable=True)
    visual_prompt: Mapped[str] = mapped_column(Text, default="", nullable=True)
    camera_angle: Mapped[str] = mapped_column(String(100), default="Medium Shot", nullable=True)
    dialogue: Mapped[str] = mapped_column(Text, default="", nullable=True)
    sound_effects: Mapped[str] = mapped_column(String(100), default="", nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), default="", nullable=True)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    grid_position: Mapped[str] = mapped_column(String(50), default="top-left", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    chapter = relationship("MangaChapter", back_populates="panels")

