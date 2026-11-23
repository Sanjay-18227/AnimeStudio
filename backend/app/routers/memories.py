import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project
from app.models.memory import ProjectMemory
from app.schemas.memory import (
    ProjectMemoryCreate,
    ProjectMemoryUpdate,
    ProjectMemoryResponse
)

router = APIRouter(prefix="/projects/{project_id}/memories", tags=["Project Memory"])

@router.get("", response_model=List[ProjectMemoryResponse])
def list_project_memories(project_id: str, db: Session = Depends(get_db)):
    """List all canon memories and lore rules established for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    memories = db.query(ProjectMemory).filter(ProjectMemory.project_id == project_id).order_by(ProjectMemory.updated_at.desc()).all()
    return memories

@router.post("", response_model=ProjectMemoryResponse, status_code=status.HTTP_201_CREATED)
def create_project_memory(project_id: str, payload: ProjectMemoryCreate, db: Session = Depends(get_db)):
    """Add a new canonical memory, rule, or lore detail to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_memory = ProjectMemory(
        id=str(uuid.uuid4()),
        project_id=project_id,
        key=payload.key.strip(),
        content=payload.content.strip(),
        category=payload.category or "lore"
    )
    db.add(new_memory)
    db.commit()
    db.refresh(new_memory)
    return new_memory

@router.put("/{memory_id}", response_model=ProjectMemoryResponse)
def update_project_memory(project_id: str, memory_id: str, payload: ProjectMemoryUpdate, db: Session = Depends(get_db)):
    """Update an existing project memory."""
    mem = db.query(ProjectMemory).filter(
        ProjectMemory.id == memory_id,
        ProjectMemory.project_id == project_id
    ).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory entry not found")

    if payload.key is not None:
        mem.key = payload.key.strip()
    if payload.content is not None:
        mem.content = payload.content.strip()
    if payload.category is not None:
        mem.category = payload.category

    db.commit()
    db.refresh(mem)
    return mem

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_memory(project_id: str, memory_id: str, db: Session = Depends(get_db)):
    """Delete a single memory entry from project lore."""
    mem = db.query(ProjectMemory).filter(
        ProjectMemory.id == memory_id,
        ProjectMemory.project_id == project_id
    ).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory entry not found")

    db.delete(mem)
    db.commit()
    return None

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_all_project_memories(project_id: str, db: Session = Depends(get_db)):
    """Clear all memories associated with this project."""
    db.query(ProjectMemory).filter(ProjectMemory.project_id == project_id).delete()
    db.commit()
    return None

