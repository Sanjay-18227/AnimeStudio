import sys
import shutil
import platform
from fastapi import APIRouter
from app.config import settings
from app.schemas.health import SystemHealthResponse, ProviderStatus

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("", response_model=SystemHealthResponse)
def get_system_health():
    """Returns the operational status of Anime Studio AI and configured free-first AI providers."""
    
    # Check FFmpeg on system
    ffmpeg_found = bool(shutil.which("ffmpeg") or (settings.FFMPEG_PATH and shutil.which(settings.FFMPEG_PATH)))

    # Provider statuses
    providers = {
        "gemini": ProviderStatus(
            name="Google Gemini API",
            category="Text / Chat / Story",
            is_configured=bool(settings.GEMINI_API_KEY.strip()),
            is_free_tier=True,
            active_model=settings.DEFAULT_GEMINI_MODEL,
            description="Google Gemini free-tier models (gemini-1.5-flash, gemini-2.0-flash)"
        ),
        "openrouter": ProviderStatus(
            name="OpenRouter (Free Tier)",
            category="Text / Chat / Story",
            is_configured=bool(settings.OPENROUTER_API_KEY.strip()),
            is_free_tier=True,
            active_model=settings.DEFAULT_OPENROUTER_MODEL,
            description="Free open-source LLMs (Llama 3.3 70B, Qwen 2.5, Mistral)"
        ),
        "huggingface": ProviderStatus(
            name="Hugging Face Inference",
            category="Anime Image Generation",
            is_configured=bool(settings.HUGGINGFACE_API_TOKEN.strip()),
            is_free_tier=True,
            active_model=settings.HF_ANIME_MODEL,
            description="Free serverless inference for SDXL and Animagine XL"
        ),
        "cloudflare": ProviderStatus(
            name="Cloudflare Workers AI",
            category="Anime Image Generation",
            is_configured=bool(settings.CLOUDFLARE_API_TOKEN.strip() and settings.CLOUDFLARE_ACCOUNT_ID.strip()),
            is_free_tier=True,
            active_model=settings.CF_IMAGE_MODEL,
            description="Cloudflare daily free tier (FLUX.1 schnell, SDXL)"
        ),
        "edge_tts": ProviderStatus(
            name="Edge Neural TTS",
            category="Voiceover & Dialogue",
            is_configured=settings.ENABLE_EDGE_TTS,
            is_free_tier=True,
            active_model="Edge Neural (English & Tamil)",
            description="Free local neural voice synthesis with English and Tamil accents"
        ),
        "ffmpeg": ProviderStatus(
            name="FFmpeg Video Pipeline",
            category="Video Composition",
            is_configured=ffmpeg_found,
            is_free_tier=True,
            active_model="Local Media Pipeline",
            description="Local video rendering, transitions, pan/zoom, and subtitle burn"
        ),
    }

    # Verify storage writable
    storage_ok = settings.STORAGE_DIR.exists() and settings.UPLOAD_DIR.exists() and settings.GENERATED_DIR.exists()

    return SystemHealthResponse(
        status="healthy",
        version="1.0.0",
        app_name="Anime Studio AI",
        environment=settings.ENVIRONMENT,
        database="SQLite (aiosqlite)" if "sqlite" in settings.DATABASE_URL else "PostgreSQL / Supabase",
        storage_ready=storage_ok,
        providers=providers,
        system_info={
            "python_version": sys.version.split()[0],
            "platform": platform.platform(),
            "active_text_provider": settings.ACTIVE_TEXT_PROVIDER,
            "active_image_provider": settings.ACTIVE_IMAGE_PROVIDER,
            "active_video_provider": settings.ACTIVE_VIDEO_PROVIDER,
            "ffmpeg_available": ffmpeg_found
        }
    )
