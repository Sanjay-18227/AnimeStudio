from datetime import datetime
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=True)
    genre: Mapped[str] = mapped_column(String(100), default="Shonen", nullable=True)
    target_audience: Mapped[str] = mapped_column(String(100), default="General", nullable=True)
    cover_image_url: Mapped[str] = mapped_column(String(500), default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    characters = relationship("Character", back_populates="project", cascade="all, delete-orphan")
    manga_stories = relationship("MangaStory", back_populates="project", cascade="all, delete-orphan")
    images = relationship("GeneratedImage", back_populates="project", cascade="all, delete-orphan")
    videos = relationship("GeneratedVideo", back_populates="project", cascade="all, delete-orphan")

