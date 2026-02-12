# app/api/v1/commits.py
"""
Commits and Activity endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from uuid import UUID

from app.dependencies import get_db
from app.models import Commit, Activity
from app.models.enums import StageType

router = APIRouter(tags=["Commits & Activity"])


@router.get("/projects/{project_id}/commits")
async def list_project_commits(
    project_id: str,
    stage: Optional[str] = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """List commit history for a project"""
    try:
        UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    query = select(Commit).where(Commit.project_id == project_id)
    
    if stage:
        try:
            stage_enum = StageType(stage.lower())
            query = query.where(Commit.stage == stage_enum)
        except ValueError:
            pass
    
    query = query.order_by(desc(Commit.created_at)).limit(limit)
    
    result = await db.execute(query)
    commits = result.scalars().all()
    
    return {
        "project_id": project_id,
        "count": len(commits),
        "commits": [
            {
                "commit_id": str(c.id),
                "stage": c.stage.value if c.stage else None,
                "author": c.author_id,
                "message": c.message,
                "changes": c.changes,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in commits
        ]
    }


@router.get("/projects/{project_id}/activity")
async def get_project_activity(
    project_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get recent activity for a project"""
    try:
        UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    result = await db.execute(
        select(Activity)
        .where(Activity.project_id == project_id)
        .order_by(desc(Activity.created_at))
        .limit(limit)
    )
    activities = result.scalars().all()
    
    return {
        "project_id": project_id,
        "count": len(activities),
        "activities": [
            {
                "activity_id": str(a.id),
                "type": a.activity_type,
                "user": a.user_id,
                "data": a.data,
                "timestamp": a.created_at.isoformat() if a.created_at else None
            }
            for a in activities
        ]
    }
