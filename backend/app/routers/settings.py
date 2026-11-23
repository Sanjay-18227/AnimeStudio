from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.settings import UserSettings
from app.schemas.settings import UserSettingsUpdate, UserSettingsResponse

router = APIRouter(prefix="/settings", tags=["User Settings"])

def get_or_create_settings(db: Session) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.id == "default_user").first()
    if not settings:
        settings = UserSettings(id="default_user")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("", response_model=UserSettingsResponse)
def get_user_settings(db: Session = Depends(get_db)):
    """Fetch current user personalization preferences."""
    return get_or_create_settings(db)

@router.put("", response_model=UserSettingsResponse)
def update_user_settings(payload: UserSettingsUpdate, db: Session = Depends(get_db)):
    """Update user personalization preferences."""
    settings = get_or_create_settings(db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            setattr(settings, field, val)

    db.commit()
    db.refresh(settings)
    return settings

@router.post("/reset", response_model=UserSettingsResponse)
def reset_user_settings(db: Session = Depends(get_db)):
    """Reset user personalization preferences to factory default."""
    settings = get_or_create_settings(db)
    settings.assistant_name = "Anime Studio AI"
    settings.personality = "friendly"
    settings.response_tone = "encouraging"
    settings.response_length = "balanced"
    settings.language = "en"
    settings.creativity_level = "balanced"
    settings.default_role = "general"
    settings.theme = "dark"
    settings.memory_enabled = True
    settings.voice_enabled = True
    settings.auto_speak_responses = False
    settings.voice_speed = 1.0

    db.commit()
    db.refresh(settings)
    return settings

