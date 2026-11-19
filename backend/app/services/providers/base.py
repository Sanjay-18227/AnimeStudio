from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class TextProvider(ABC):
    """Abstract base class for all Text & Story AI generation providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the text AI provider (e.g., 'gemini', 'openrouter', 'mock')."""
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text completion from prompt."""
        pass

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        model: Optional[str] = None
    ) -> str:
        """Multi-turn chat completion."""
        pass


class ImageProvider(ABC):
    """Abstract base class for all Image AI generation & transformation providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the image AI provider (e.g., 'huggingface', 'cloudflare', 'mock')."""
        pass

    @abstractmethod
    async def text_to_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        steps: int = 30,
        model: Optional[str] = None
    ) -> bytes:
        """Generate anime image bytes from text prompt."""
        pass

    @abstractmethod
    async def image_to_image(
        self,
        image_bytes: bytes,
        prompt: str,
        strength: float = 0.65,
        model: Optional[str] = None
    ) -> bytes:
        """Transform an input photo/image into anime style."""
        pass


class SpeechProvider(ABC):
    """Abstract base class for Voice & Text-to-Speech synthesis."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the speech provider (e.g., 'edge_tts', 'mock')."""
        pass

    @abstractmethod
    async def text_to_speech(
        self,
        text: str,
        voice: Optional[str] = None,
        language: str = "en"
    ) -> bytes:
        """Generate speech audio bytes (MP3/WAV) from text."""
        pass


class VideoProvider(ABC):
    """Abstract base class for Video composition & AI video models."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the video provider (e.g., 'ffmpeg_composer', 'wan2.1')."""
        pass

    @abstractmethod
    async def render_storyboard_video(
        self,
        scene_images: List[str],
        audio_path: Optional[str] = None,
        subtitles: Optional[List[Dict[str, Any]]] = None,
        output_filename: str = "output.mp4"
    ) -> str:
        """Compose scenes into an MP4 video."""
        pass

