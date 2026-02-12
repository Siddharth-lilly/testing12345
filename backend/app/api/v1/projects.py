# app/api/v1/projects.py
"""
Project CRUD endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("")
async def create_project(
    request: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new project"""
    service = ProjectService(db)
    project = await service.create_project(
        name=request.name,
        description=request.description,
        created_by=request.created_by,
    )
    return service.to_dict(project)


@router.get("")
async def list_projects(
    db: AsyncSession = Depends(get_db)
):
    """List all projects"""
    service = ProjectService(db)
    projects = await service.list_projects()
    return [service.to_dict(p) for p in projects]


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get project by ID"""
    try:
        project_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    service = ProjectService(db)
    project = await service.get_project(project_uuid)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return service.to_dict(project)


@router.put("/{project_id}")
async def update_project(
    project_id: str,
    request: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update project"""
    try:
        project_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    service = ProjectService(db)
    project = await service.get_project(project_uuid)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields if provided
    if request.name is not None:
        project.name = request.name
    if request.description is not None:
        project.description = request.description
    if request.stages_config is not None:
        await service.update_stages_config(project_uuid, request.stages_config)
        await db.refresh(project)
    
    await db.commit()
    await db.refresh(project)
    
    return service.to_dict(project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete project"""
    try:
        project_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    service = ProjectService(db)
    project = await service.get_project(project_uuid)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(project)
    await db.commit()
    
    return {"status": "deleted", "id": project_id}


@router.put("/{project_id}/stage")
async def update_project_stage(
    project_id: str,
    stage: str,
    db: AsyncSession = Depends(get_db)
):
    """Update project's current stage"""
    try:
        project_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    service = ProjectService(db)
    project = await service.update_stage(project_uuid, stage)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return service.to_dict(project)


@router.put("/{project_id}/stages-config")
async def update_stages_config(
    project_id: str,
    config: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update project's stages configuration"""
    try:
        project_uuid = UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    service = ProjectService(db)
    project = await service.update_stages_config(project_uuid, config)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return service.to_dict(project)
