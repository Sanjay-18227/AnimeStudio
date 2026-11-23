@echo off
title Anime Studio AI - Backend (FastAPI)
echo ========================================================
echo   Starting Anime Studio AI - Backend Server
echo   API: http://127.0.0.1:8000
echo   Docs: http://127.0.0.1:8000/docs
echo ========================================================
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
