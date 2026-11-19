import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.project import Project
from app.models.character import Character
from app.models.manga import MangaStory, MangaChapter
from app.models.media import GeneratedImage, GeneratedVideo
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """List all anime & manga projects with asset count metrics."""
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()

    response_list = []
    for proj in projects:
        # Count associated entities
        char_count = db.query(func.count(Character.id)).filter(Character.project_id == proj.id).scalar() or 0
        img_count = db.query(func.count(GeneratedImage.id)).filter(GeneratedImage.project_id == proj.id).scalar() or 0
        vid_count = db.query(func.count(GeneratedVideo.id)).filter(GeneratedVideo.project_id == proj.id).scalar() or 0

        # Count chapters across stories in this project
        story_ids = [s.id for s in db.query(MangaStory.id).filter(MangaStory.project_id == proj.id).all()]
        chap_count = 0
        if story_ids:
            chap_count = db.query(func.count(MangaChapter.id)).filter(MangaChapter.story_id.in_(story_ids)).scalar() or 0

        response_list.append(
            ProjectResponse(
                id=proj.id,
                title=proj.title,
                description=proj.description or "",
                genre=proj.genre or "Shonen",
                target_audience=proj.target_audience or "General",
                cover_image_url=proj.cover_image_url or "",
                created_at=proj.created_at,
                updated_at=proj.updated_at,
                characters_count=char_count,
                chapters_count=chap_count,
                images_count=img_count,
                videos_count=vid_count
            )
        )
    return response_list

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new anime/manga project."""
    new_id = str(uuid.uuid4())
    new_project = Project(
        id=new_id,
        title=payload.title,
        description=payload.description or "",
        genre=payload.genre or "Shonen",
        target_audience=payload.target_audience or "General",
        cover_image_url=payload.cover_image_url or ""
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return ProjectResponse(
        id=new_project.id,
        title=new_project.title,
        description=new_project.description,
        genre=new_project.genre,
        target_audience=new_project.target_audience,
        cover_image_url=new_project.cover_image_url,
        created_at=new_project.created_at,
        updated_at=new_project.updated_at,
        characters_count=0,
        chapters_count=0,
        images_count=0,
        videos_count=0
    )

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get project details by ID."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    char_count = db.query(func.count(Character.id)).filter(Character.project_id == proj.id).scalar() or 0
    img_count = db.query(func.count(GeneratedImage.id)).filter(GeneratedImage.project_id == proj.id).scalar() or 0
    vid_count = db.query(func.count(GeneratedVideo.id)).filter(GeneratedVideo.project_id == proj.id).scalar() or 0

    story_ids = [s.id for s in db.query(MangaStory.id).filter(MangaStory.project_id == proj.id).all()]
    chap_count = 0
    if story_ids:
        chap_count = db.query(func.count(MangaChapter.id)).filter(MangaChapter.story_id.in_(story_ids)).scalar() or 0

    return ProjectResponse(
        id=proj.id,
        title=proj.title,
        description=proj.description or "",
        genre=proj.genre or "Shonen",
        target_audience=proj.target_audience or "General",
        cover_image_url=proj.cover_image_url or "",
        created_at=proj.created_at,
        updated_at=proj.updated_at,
        characters_count=char_count,
        chapters_count=chap_count,
        images_count=img_count,
        videos_count=vid_count
    )

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    """Update project details."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.title is not None:
        proj.title = payload.title
    if payload.description is not None:
        proj.description = payload.description
    if payload.genre is not None:
        proj.genre = payload.genre
    if payload.target_audience is not None:
        proj.target_audience = payload.target_audience
    if payload.cover_image_url is not None:
        proj.cover_image_url = payload.cover_image_url

    db.commit()
    db.refresh(proj)
    return get_project(project_id, db)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete a project and all associated creative assets."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(proj)
    db.commit()
    return None
