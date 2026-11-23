from datetime import datetime
from typing import List
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class MangaStory(Base):
    __tablename__ = "manga_stories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    genre: Mapped[str] = mapped_column(String(255), default="Action", nullable=True)
    subgenre: Mapped[str] = mapped_column(String(100), default="", nullable=True)
    premise: Mapped[str] = mapped_column(Text, default="", nullable=True)
    logline: Mapped[str] = mapped_column(Text, default="", nullable=True)
    synopsis: Mapped[str] = mapped_column(Text, default="", nullable=True)
    world_building: Mapped[str] = mapped_column(Text, default="", nullable=True)
    setting: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    time_period: Mapped[str] = mapped_column(String(100), default="", nullable=True)
    art_direction: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    target_audience: Mapped[str] = mapped_column(String(100), default="Shonen", nullable=True)
    language: Mapped[str] = mapped_column(String(20), default="en", nullable=True)
    tone: Mapped[str] = mapped_column(String(100), default="Dramatic", nullable=True)
    ending_type: Mapped[str] = mapped_column(String(100), default="Epic", nullable=True)
    main_conflict: Mapped[str] = mapped_column(Text, default="", nullable=True)
    story_arcs: Mapped[str] = mapped_column(Text, default="", nullable=True)
    themes: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="manga_stories")
    characters = relationship("StoryCharacter", back_populates="story", cascade="all, delete-orphan", order_by="StoryCharacter.created_at")
    chapters = relationship("StoryChapter", back_populates="story", cascade="all, delete-orphan", order_by="StoryChapter.chapter_number")


class StoryCharacter(Base):
    __tablename__ = "story_characters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    story_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_stories.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(100), default="Protagonist", nullable=True)
    age: Mapped[str] = mapped_column(String(50), default="", nullable=True)
    appearance: Mapped[str] = mapped_column(Text, default="", nullable=True)
    hair: Mapped[str] = mapped_column(String(200), default="", nullable=True)
    eye_color: Mapped[str] = mapped_column(String(100), default="", nullable=True)
    clothing: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    body_type: Mapped[str] = mapped_column(String(100), default="", nullable=True)
    personality: Mapped[str] = mapped_column(Text, default="", nullable=True)
    abilities: Mapped[str] = mapped_column(Text, default="", nullable=True)
    relationships_desc: Mapped[str] = mapped_column(Text, default="", nullable=True)
    visual_prompt: Mapped[str] = mapped_column(Text, default="", nullable=True)
    reference_image_url: Mapped[str] = mapped_column(String(500), default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    story = relationship("MangaStory", back_populates="characters")


class StoryChapter(Base):
    __tablename__ = "manga_chapters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    story_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_stories.id", ondelete="CASCADE"), nullable=False)
    chapter_number: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="", nullable=True)
    script: Mapped[str] = mapped_column(Text, default="", nullable=True)
    cliffhanger: Mapped[str] = mapped_column(Text, default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    story = relationship("MangaStory", back_populates="chapters")
    scenes = relationship("StoryScene", back_populates="chapter", cascade="all, delete-orphan", order_by="StoryScene.scene_number")
    panels = relationship("MangaPanel", back_populates="chapter", cascade="all, delete-orphan", order_by="MangaPanel.panel_number")

# Backward compatibility alias
MangaChapter = StoryChapter


class StoryScene(Base):
    __tablename__ = "manga_scenes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    chapter_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_chapters.id", ondelete="CASCADE"), nullable=False)
    scene_number: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    time_of_day: Mapped[str] = mapped_column(String(100), default="Day", nullable=True)
    description: Mapped[str] = mapped_column(Text, default="", nullable=True)
    mood: Mapped[str] = mapped_column(String(100), default="Dramatic", nullable=True)
    visual_prompt: Mapped[str] = mapped_column(Text, default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    chapter = relationship("StoryChapter", back_populates="scenes")
    panels = relationship("MangaPanel", back_populates="scene", cascade="all, delete-orphan", order_by="MangaPanel.panel_number")


class MangaPanel(Base):
    __tablename__ = "manga_panels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    chapter_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_chapters.id", ondelete="CASCADE"), nullable=False)
    scene_id: Mapped[str] = mapped_column(String(36), ForeignKey("manga_scenes.id", ondelete="CASCADE"), nullable=True)
    panel_number: Mapped[int] = mapped_column(Integer, default=1)
    shot_type: Mapped[str] = mapped_column(String(100), default="Medium Shot", nullable=True)
    camera_angle: Mapped[str] = mapped_column(String(100), default="Eye Level", nullable=True)
    visual_description: Mapped[str] = mapped_column(Text, default="", nullable=True)
    scene_description: Mapped[str] = mapped_column(Text, default="", nullable=True)
    dialogues: Mapped[str] = mapped_column(Text, default="[]", nullable=True)
    dialogue: Mapped[str] = mapped_column(Text, default="", nullable=True)
    sound_effects: Mapped[str] = mapped_column(Text, default="[]", nullable=True)
    narration: Mapped[str] = mapped_column(Text, default="", nullable=True)
    emotion: Mapped[str] = mapped_column(String(100), default="Neutral", nullable=True)
    visual_prompt: Mapped[str] = mapped_column(Text, default="", nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), default="", nullable=True)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    grid_position: Mapped[str] = mapped_column(String(50), default="top-left", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    chapter = relationship("StoryChapter", back_populates="panels")
    scene = relationship("StoryScene", back_populates="panels")


def migrate_manga_tables(engine):
    """Safely adds missing columns to existing SQLite tables without losing data."""
    if "sqlite" not in str(engine.url):
        return

    columns_to_ensure = {
        "manga_stories": [
            ("genre", "VARCHAR(255) DEFAULT 'Action'"),
            ("subgenre", "VARCHAR(100) DEFAULT ''"),
            ("premise", "TEXT DEFAULT ''"),
            ("world_building", "TEXT DEFAULT ''"),
            ("setting", "VARCHAR(255) DEFAULT ''"),
            ("time_period", "VARCHAR(100) DEFAULT ''"),
            ("art_direction", "VARCHAR(255) DEFAULT ''"),
            ("target_audience", "VARCHAR(100) DEFAULT 'Shonen'"),
            ("tone", "VARCHAR(100) DEFAULT 'Dramatic'"),
            ("ending_type", "VARCHAR(100) DEFAULT 'Epic'"),
            ("main_conflict", "TEXT DEFAULT ''"),
            ("story_arcs", "TEXT DEFAULT ''"),
        ],
        "manga_chapters": [
            ("cliffhanger", "TEXT DEFAULT ''"),
            ("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
        ],
        "manga_panels": [
            ("scene_id", "VARCHAR(36)"),
            ("shot_type", "VARCHAR(100) DEFAULT 'Medium Shot'"),
            ("visual_description", "TEXT DEFAULT ''"),
            ("dialogues", "TEXT DEFAULT '[]'"),
            ("narration", "TEXT DEFAULT ''"),
            ("emotion", "VARCHAR(100) DEFAULT 'Neutral'"),
        ]
    }

    with engine.connect() as conn:
        for table_name, cols in columns_to_ensure.items():
            try:
                # Check table exists
                check = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")).fetchone()
                if not check:
                    continue
                # Get existing columns
                existing_cols = [row[1] for row in conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()]
                for col_name, col_def in cols:
                    if col_name not in existing_cols:
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def}"))
                conn.commit()
            except Exception as e:
                # Ignore duplicate or locked errors
                pass
