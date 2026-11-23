"""Optional and client-side Voice Engine Adapters for Anime Studio AI."""
from typing import Dict, Any, List, Optional
import os
import shutil

class VoiceAdapterBase:
    """Base interface for Speech-to-Text and Text-to-Speech engines."""
    @property
    def name(self) -> str:
        raise NotImplementedError

    @property
    def is_available(self) -> bool:
        raise NotImplementedError

class BrowserSpeechAdapter(VoiceAdapterBase):
    """Client-Side Web Speech API (SpeechRecognition & SpeechSynthesis).
    Operates 100% free directly inside Chrome, Edge, Safari and Firefox.
    """
    @property
    def name(self) -> str:
        return "Browser Web Speech API"

    @property
    def is_available(self) -> bool:
        return True

    def get_supported_languages(self) -> List[Dict[str, str]]:
        return [
            {"code": "en-US", "name": "English (US)", "flag": "🇺🇸"},
            {"code": "ta-IN", "name": "Tamil (தமிழ்)", "flag": "🇮🇳"},
            {"code": "ja-JP", "name": "Japanese (日本語)", "flag": "🇯🇵"}
        ]

class WhisperCppAdapter(VoiceAdapterBase):
    """Optional adapter for local offline Whisper.cpp speech recognition server/binary."""
    def __init__(self, binary_path: Optional[str] = None):
        self.binary_path = binary_path or os.getenv("WHISPER_CPP_PATH", "")

    @property
    def name(self) -> str:
        return "Whisper.cpp (Local STT)"

    @property
    def is_available(self) -> bool:
        return bool(self.binary_path and shutil.which(self.binary_path))

class PiperTTSAdapter(VoiceAdapterBase):
    """Optional adapter for fast local neural Piper TTS."""
    def __init__(self, binary_path: Optional[str] = None):
        self.binary_path = binary_path or os.getenv("PIPER_TTS_PATH", "")

    @property
    def name(self) -> str:
        return "Piper (Local Neural TTS)"

    @property
    def is_available(self) -> bool:
        return bool(self.binary_path and shutil.which(self.binary_path))

voice_registry = {
    "browser": BrowserSpeechAdapter(),
    "whisper": WhisperCppAdapter(),
    "piper": PiperTTSAdapter()
}

