# Anime Studio AI 🎨✨

> **Anime Studio AI** is an all-in-one, professional creative production suite designed for anime and manga creators. Build complete manga stories, dynamic panels, persistent anime characters, AI artwork, photo-to-anime transformations, animated video storyboards with voiceovers, and export your production assets from a single unified web platform.

---

## 🌟 Key Features

1. **AI Chat Studio**:
   - Conversational anime co-pilot for storytelling, scriptwriting, character brainstorming, and prompt optimization.
   - Dual-language support: **English** and **Tamil (தமிழ்)**.
2. **Manga Studio**:
   - Outline stories, generate chapters, split chapters into scenes, and create dynamic panel descriptions with dialogue scripts.
   - Assemble full comic page layouts and export ready-to-print or digital manga pages.
3. **Character Studio**:
   - Create persistent character dossiers (biography, personality, visual traits, hair, outfit, special abilities).
   - Maintain character prompt consistency across different chapters, angles, and scenes.
4. **Anime Image Studio**:
   - High-fidelity text-to-image generation tuned for anime aesthetics (SDXL, Animagine XL, FLUX.1 schnell).
   - Create portraits, action shots, wallpapers, and manga screentones.
5. **Photo-to-Anime Transformation**:
   - Transform real-life portraits and scenes into Japanese anime art styles.
6. **Anime Video Studio**:
   - Turn scenes into animated storyboards with camera movements (pans, zooms, tilts), transitions, neural voiceovers, subtitles, and FFmpeg MP4 rendering.
7. **My Projects Hub**:
   - Organize multiple creative series, organize chapters, archive generation history, and export complete project packages.

---

## 💎 Free-First AI Architecture

Anime Studio AI prioritizes **free-tier and open-source models** so that you can create without requiring a credit card or paid subscriptions:

| Capability | Free Providers Supported | Default Model |
| :--- | :--- | :--- |
| **Text & Scripting** | Google Gemini API (Free tier), OpenRouter Free | `gemini-1.5-flash` |
| **Image Generation** | Hugging Face Free Inference API, Cloudflare Workers AI | `Animagine XL` / `FLUX.1 schnell` |
| **Photo-to-Anime** | SDXL img2img / Hugging Face Free Inference | Anime LoRA / SDXL img2img |
| **Voiceover / TTS** | Edge TTS (Local Neural Voices - English & Tamil) | Neural Voices (`en-US`, `ta-IN`) |
| **Video Assembly** | Local FFmpeg Pipeline | FFmpeg Storyboard Composer |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested with Python 3.14)
- **Node.js 18+** & npm
- *(Optional)* **FFmpeg** installed on your system for video rendering

### 1. Clone & Setup Backend
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp ../.env.example .env

# Run FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`. Interactive API documentation: `http://127.0.0.1:8000/docs`.

### 2. Setup Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend interface will be available at `http://localhost:5173`.

---

## 📁 Project Architecture

```
AnimeStudio/
├── AGENTS.md                  # Master architectural rules & guidelines
├── README.md                  # Project overview and documentation
├── .env.example               # Free-tier AI API configuration template
├── .gitignore                 # Git ignore file
├── backend/
│   ├── app/
│   │   ├── core/              # Database engine, session, configs
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic request & response schemas
│   │   ├── services/          # Abstract AI provider services
│   │   ├── routers/           # FastAPI modular endpoints
│   │   └── main.py            # FastAPI entry point
│   ├── storage/               # Generated media, uploads, and assets
│   └── requirements.txt       # Python backend dependencies
└── frontend/
    ├── public/                # Static assets & icons
    ├── src/
    │   ├── components/
    │   │   ├── layout/        # Sidebar, Header, Navigation
    │   │   └── studios/       # Studio modules (Chat, Manga, Character, Image, Video, Projects)
    │   ├── services/          # API client for backend
    │   ├── App.jsx            # Main application router & state
    │   └── index.css          # Tailwind CSS styles & anime theme
    ├── package.json           # Frontend dependencies
    └── vite.config.js         # Vite configuration
```

---

## 🛠️ Development Phases

- [x] **Phase 1**: Project structure, architecture baseline, and responsive anime production dashboard.
- [ ] **Phase 2**: Backend AI provider abstractions & AI Chat Studio (bilingual English/Tamil).
- [ ] **Phase 3**: Manga Studio (storyline, chapters, scenes, dialogue generation).
- [ ] **Phase 4**: Character Studio (persistent profiles, consistency sheets).
- [ ] **Phase 5**: Anime Image Studio (text-to-image, styles, wallpapers).
- [ ] **Phase 6**: Photo-to-Anime transformation studio.
- [ ] **Phase 7**: Manga panel & comic page generator with layouts.
- [ ] **Phase 8**: Anime Video Studio (storyboard sequencer, voiceovers, subtitles, FFmpeg).
- [ ] **Phase 9**: Projects hub, database persistence, and project export.
- [ ] **Phase 10**: Testing, security audit, deployment setup (Cloudflare Pages + backend).

---

## 📜 License
MIT License. Built with passion for anime creators.

