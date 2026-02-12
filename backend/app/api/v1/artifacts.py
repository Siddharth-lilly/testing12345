# app/api/v1/artifacts.py
"""
Artifact endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db
from app.schemas.artifact import RegenerateRequest
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])


@router.get("/{artifact_id}")
async def get_artifact(
    artifact_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get artifact by ID"""
    try:
        artifact_uuid = UUID(artifact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid artifact ID format")
    
    service = ArtifactService(db)
    artifact = await service.get_artifact(artifact_uuid)
    
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    return service.to_dict(artifact)


@router.post("/regenerate")
async def regenerate_artifact(
    request: RegenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerate an artifact based on user feedback.
    
    This endpoint:
    1. Fetches the existing artifact
    2. Gets all chat history from the relevant stage for context
    3. Uses specialized prompts for each artifact type
    4. Creates a new version incorporating the feedback
    
    Args:
        request: Contains artifact_id, feedback, and optional created_by
        
    Returns:
        The new artifact version with improvements
    """
    try:
        artifact_uuid = UUID(request.artifact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid artifact ID format")
    
    service = ArtifactService(db)
    
    # First, fetch the artifact
    artifact = await service.get_artifact(artifact_uuid)
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    print(f"🔄 Regenerate request for: {artifact.name}")
    print(f"   └── Feedback: {request.feedback[:100]}...")
    
    try:
        # Regenerate with feedback
        new_artifact = await service.regenerate_artifact(
            artifact=artifact,
            feedback=request.feedback,
            created_by=request.created_by
        )
        
        return service.to_dict(new_artifact)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Regeneration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")


# Project-scoped artifact endpoints
@router.get("/project/{project_id}")
async def list_project_artifacts(
    project_id: str,
    stage: Optional[str] = None,
    artifact_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List artifacts for a project - ALWAYS returns an array"""
    try:
        UUID(project_id)
    except ValueError:
        # Return empty array instead of error for invalid UUID
        return []
    
    try:
        service = ArtifactService(db)
        artifacts = await service.list_project_artifacts(
            project_id=project_id,
            stage=stage,
            artifact_type=artifact_type
        )
        return [service.to_dict(a) for a in artifacts]
    except Exception as e:
        print(f"Error listing artifacts: {str(e)}")
        # Return empty array on error instead of raising exception
        return []


@router.get("/project/{project_id}/stage/{stage}")
async def get_stage_artifacts(
    project_id: str,
    stage: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all artifacts for a specific stage"""
    try:
        UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    service = ArtifactService(db)
    artifacts = await service.get_stage_artifacts(project_id, stage)
    
    return {
        "project_id": project_id,
        "stage": stage,
        "count": len(artifacts),
        "artifacts": [service.to_dict(a) for a in artifacts]
    }