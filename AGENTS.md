# AGENTS.md — Anime Studio AI Architecture & Development Guidelines

This document governs all AI agents and developers working on **Anime Studio AI**. All guidelines, constraints, and operational principles in this document MUST be followed strictly at all times.

---

## 1. Project Overview & Objective

**Anime Studio AI** is an all-in-one, professional-grade creative production suite for anime and manga creators. It unites story development, character design, manga layout creation, AI anime imagery, photo-to-anime stylization, video composition, and voiceover synchronization into a single modular web platform.

### Core Modules
1. **AI Chat Studio**: Conversational anime assistant for story brainstorming, character conception, scriptwriting, and creative prompt engineering. Bilingual support: English and Tamil (தமிழ்).
2. **Manga Studio**: Full pipeline from story outline, chapters, and scene breakdown to panel descriptions, dialogue scripts, comic grid layouts, and page export.
3. **Character Studio**: Persistent character profiles (biography, appearance, hairstyles, outfits, personality traits, signature abilities) and visual consistency reference sheets across scenes.
4. **Anime Image Studio**: High-fidelity text-to-image, photo-to-anime transformation, character portraits, wallpapers, manga screentone illustrations, and image variations.
5. **Anime Video Studio**: Scene-by-scene storyboard video composer, motion transitions, camera panning/zooming, AI video model adapters (e.g. Wan 2.1), subtitle generators, AI voiceover sync, and FFmpeg MP4 export.
6. **My Projects**: Central project management, chapter organization, asset library (stories, characters, images, audio, video cuts), and project bundle export.

---

## 2. Free-First AI Architecture & Provider Rules

The platform must operate **out of the box without requiring paid subscriptions or credit cards**. Free and open-source models are prioritized.

### AI Provider Categories
- **Text & Creative Writing**:
  - Google Gemini API (Free tier: Gemini 1.5 Flash, Gemini 2.0 Flash / Flash Lite).
  - OpenRouter Free Models (e.g., Meta Llama 3.3 70B Instruct:free, Mistral 7B:free, Qwen 2.5:free).
  - Configurable model selector per project or studio session.
- **Image Generation & Transformation**:
  - Cloudflare Workers AI free tier models (@cf/black-forest-labs/flux-1-schnell, @cf/stabilityai/stable-diffusion-xl-base-1.0).
  - Hugging Face Inference API (free tier endpoints for SDXL, FLUX.1-schnell, anime LoRAs/checkpoints like Animagine XL, Counterfeit, Pastel-Mix).
  - Local / Fallback image pipelines and SDXL Image-to-Image for photo-to-anime.
- **Video Generation & Composition**:
  - FFmpeg for local/server video assembly, panning/zoom (Ken Burns), scene sequencing, audio mixing, and subtitle burning.
  - Video Provider Adapter interface for optional generative AI video models (e.g., Wan 2.1, CogVideoX, or Hugging Face Spaces free tiers).
  - **Rule**: Never pretend FFmpeg alone is AI video generation; clearly distinguish between AI video synthesis and programmatic video assembly.
- **Speech & Audio**:
  - Free edge-tts / local text-to-speech engines (high-quality neural voices in English and Tamil).
  - Web Speech API fallback in the browser.
  - Extensible voice provider interface for ElevenLabs or custom TTS if configured.

### Golden Rules for AI Providers:
1. **Truth in Pricing**: Never claim an API or model is free unless its current pricing terms have been explicitly verified.
2. **Never Require Paid APIs**: Every single feature must have a functioning free tier or mock/local fallback option so users are never blocked.
3. **No Ollama**: Do not use Ollama as a dependency.
4. **No Hardcoded Keys**: API keys must be loaded exclusively through backend environment variables (`.env`) or securely passed by the user in-session settings.
5. **No Secret Leaks**: Secret keys, tokens, or private credentials must NEVER be bundled, logged, or exposed to the frontend.
6. **Provider Abstraction**: All AI capabilities must be invoked through abstract provider interfaces (`TextProvider`, `ImageProvider`, `VideoProvider`, `SpeechProvider`). Changing an AI provider must never require touching UI or business logic.

---

## 3. Technology Stack

- **Backend**: Python 3.10+, FastAPI (asynchronous REST API, WebSockets where needed), Pydantic v2, SQLAlchemy with aiosqlite for SQLite (with zero-code migration path to Supabase / PostgreSQL).
- **Frontend**: React 18/19, Vite, Tailwind CSS, Lucide React (icons), modern canvas/grid layout tools.
- **Audio/Video Processing**: FFmpeg (via system binary or imageio-ffmpeg / static builds), edge-tts for speech synthesis.
- **Data Persistence**: Local SQLite database (`anime_studio.db`), file-based media storage in `backend/storage/`, optional Supabase integration for cloud sync.
- **Version Control**: Git & GitHub with clean `.gitignore`.

---

## 4. UI/UX Design System

The visual aesthetic reflects a **premium anime production workstation** (reminiscent of professional tools like Clip Studio Paint, DaVinci Resolve, and Figma Dark, tailored for anime creators):
- **Theme**: Deep space dark mode (`#0B0D17` / `#121526`).
- **Accent Colors**: Electric Violet / Anime Purple (`#8B5CF6`, `#A855F7`), Cyberpunk Blue / Cyan (`#3B82F6`, `#06B6D4`), Neon Pink accents (`#EC4899`).
- **Surfaces**: Frosted glassmorphism (`backdrop-blur-md`), subtle glowing borders (`border-purple-500/20`), distinct elevation layers.
- **Typography**: Clean, readable sans-serif (Inter / Plus Jakarta Sans) paired with stylized anime display headers.
- **Layout**: Collapsible sidebar navigation, contextual top bar with active project/provider indicators, fluid central workspace, and responsive drawer panels for settings and inspect tools.
- **State Feedback**: Skeleton loaders, pulsing generation indicators, explicit error boundaries, and informative toast notifications.

---

## 5. Development Phases & Methodology

Development proceeds strictly in sequential phases. Do not advance to the next phase until the current phase is implemented and tested.

- **Phase 1**: Project structure, configuration, backend base, and responsive anime production dashboard.
- **Phase 2**: Backend AI provider abstractions, secure routing, and AI Chat Studio (bilingual English/Tamil brainstorming & prompt assistant).
- **Phase 3**: Manga Studio backend & UI (story outlines, chapter generation, scene breakdown, dialogue scripts).
- **Phase 4**: Character Studio (persistent profiles, attributes, consistent prompt generation, visual reference sheets).
- **Phase 5**: Anime Image Studio (text-to-image generation, prompts, anime art styles, variations, gallery).
- **Phase 6**: Photo-to-Anime transformation studio (image-to-image pipeline, edge detection/anime filters, side-by-side comparison).
- **Phase 7**: Manga panel and comic page generation (grid layout composer, speech bubbles, screentones, PDF/PNG export).
- **Phase 8**: Anime Video Studio (storyboard to scenes, camera movement, audio/voiceover synthesis, subtitle overlay, FFmpeg MP4 export).
- **Phase 9**: Projects hub, persistent storage, import/export (JSON, ZIP project packages), and Supabase optional cloud sync.
- **Phase 10**: End-to-end testing, error handling audit, performance optimization, production documentation, and deployment guides.

### Mandatory Pre-Phase & Post-Phase Protocol:
Before every phase:
1. Explain the implementation plan.
2. Inspect the existing files and state.
3. Implement the feature according to specs.
4. Run tests and verify functionality.
5. Fix errors and regressions immediately.
6. Report completed work and remaining tasks.

---

## 6. Security & Quality Standards

- **Environment Separation**: Always maintain a `.env.example` with clear instructions on obtaining free API keys (Gemini, HuggingFace, Cloudflare, etc.).
- **Input Validation**: Validate all client payloads using Pydantic schemas. Validate and sanitize file uploads for photo-to-anime.
- **Data Protection**: Local files stored in isolated `storage/` directory; avoid arbitrary file write paths.
- **Documentation**: All modules must include concise docstrings and clear frontend component structure.
- **Testing**: Maintain unit/integration test scripts for endpoints and verify frontend builds without warnings or errors.

