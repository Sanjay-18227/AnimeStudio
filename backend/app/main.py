from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core.database import init_db
from app.routers.health import router as health_router
from app.routers.projects import router as projects_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Anime Studio AI - Backend API",
    description="Dedicated AI-powered creative engine for Manga & Anime production",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage for static assets (images, video exports, uploads)
app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

# Include Routers
app.include_router(health_router, prefix="/api")
app.include_router(projects_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "Anime Studio AI",
        "tagline": "The Premier AI Manga & Anime Production Suite",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "status": "operational"
    }
