import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    # Database
    DATABASE_URL: str = "sqlite:///./anime_studio.db"

    # Storage paths
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    GENERATED_DIR: Path = BASE_DIR / "storage" / "generated"

    # Text AI Providers (Free-first)
    GEMINI_API_KEY: str = ""
    DEFAULT_GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    OPENROUTER_API_KEY: str = ""
    DEFAULT_OPENROUTER_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"
    ACTIVE_TEXT_PROVIDER: str = "gemini"

    # Image AI Providers (Free-first)
    HUGGINGFACE_API_TOKEN: str = ""
    HF_IMAGE_MODEL: str = "stabilityai/stable-diffusion-xl-base-1.0"
    HF_ANIME_MODEL: str = "cagliostrolab/animagine-xl-3.1"
    CLOUDFLARE_ACCOUNT_ID: str = ""
    CLOUDFLARE_API_TOKEN: str = ""
    CF_IMAGE_MODEL: str = "@cf/black-forest-labs/flux-1-schnell"
    ACTIVE_IMAGE_PROVIDER: str = "huggingface"

    # Video AI & Audio
    FFMPEG_PATH: str = ""
    VIDEO_PROVIDER_API_KEY: str = ""
    ACTIVE_VIDEO_PROVIDER: str = "ffmpeg_composer"
    ENABLE_EDGE_TTS: bool = True
    DEFAULT_VOICE_EN: str = "en-US-ChristopherNeural"
    DEFAULT_VOICE_TA: str = "ta-IN-PallaviNeural"

    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Ensure storage directories exist
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
