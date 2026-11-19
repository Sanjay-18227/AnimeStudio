import sys
from pathlib import Path
import asyncio

# Ensure backend path is on sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import root
from app.routers.health import get_system_health
from app.routers.projects import create_project, list_projects, get_project, update_project, delete_project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.core.database import init_db, SessionLocal

def run_tests():
    print("--- 1. Initializing DB ---")
    init_db()
    db = SessionLocal()

    print("--- 2. Testing Root Handler ---")
    r = root()
    assert r["app"] == "Anime Studio AI"
    assert r["status"] == "operational"
    print("Root test PASS:", r)

    print("--- 3. Testing Health Handler ---")
    health = get_system_health()
    assert health.status == "healthy"
    assert "gemini" in health.providers
    assert "huggingface" in health.providers
    print("Health test PASS. Providers count:", len(health.providers))

    print("--- 4. Testing Project Creation ---")
    payload = ProjectCreate(
        title="Solo Leveling Chronicle",
        description="A hunter awakening in modern Seoul with anime powers",
        genre="Action / Supernatural",
        target_audience="Shonen"
    )
    created = create_project(payload, db)
    assert created.title == "Solo Leveling Chronicle"
    project_id = created.id
    print("Created project PASS. ID:", project_id)

    print("--- 5. Testing List Projects ---")
    projects_list = list_projects(db)
    assert any(p.id == project_id for p in projects_list)
    print("List projects PASS. Total projects:", len(projects_list))

    print("--- 6. Testing Get Project ---")
    fetched = get_project(project_id, db)
    assert fetched.id == project_id
    assert fetched.title == "Solo Leveling Chronicle"
    print("Get project PASS:", fetched.title)

    print("--- 7. Testing Update Project ---")
    updated = update_project(project_id, ProjectUpdate(genre="Cyberpunk Shonen"), db)
    assert updated.genre == "Cyberpunk Shonen"
    print("Update project PASS:", updated.genre)

    print("--- 8. Testing Delete Project ---")
    delete_project(project_id, db)
    print("Delete project PASS")

    # Confirm deletion
    try:
        get_project(project_id, db)
        assert False, "Should have raised 404"
    except Exception as e:
        print("Confirmed 404 on deleted project PASS")

    db.close()
    print("==================================================")
    print(">>> ALL BACKEND DIRECT TESTS PASSED 100%! <<<")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
