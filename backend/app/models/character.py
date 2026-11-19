from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Character(Base):
    __tablename__ = "characters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[str] = mapped_column(String(50), default="", nullable=True)
    role: Mapped[str] = mapped_column(String(100), default="Protagonist", nullable=True)
    background: Mapped[str] = mapped_column(Text, default="", nullable=True)
    appearance: Mapped[str] = mapped_column(Text, default="", nullable=True)
    hairstyle: Mapped[str] = mapped_column(String(200), default="", nullable=True)
    clothing: Mapped[str] = mapped_column(String(255), default="", nullable=True)
    personality: Mapped[str] = mapped_column(Text, default="", nullable=True)
    abilities: Mapped[str] = mapped_column(Text, default="", nullable=True)
    visual_prompt: Mapped[str] = mapped_column(Text, default="", nullable=True)
    reference_image_url: Mapped[str] = mapped_column(String(500), default="", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="characters")

