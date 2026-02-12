# app/services/activity_service.py - Activity logging service
"""
Service for logging project activities.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import Activity
from app.services.base import BaseService


class ActivityService(BaseService[Activity]):
    """Service for managing activity logs."""
    
    model = Activity
    
    async def log(
        self,
        project_id: str,
        user_id: str,
        activity_type: str,
        data: Dict[str, Any]
    ) -> Activity:
        """
        Log a new activity.
        
        Args:
            project_id: ID of the project
            user_id: ID of the user who performed the action
            activity_type: Type of activity (e.g., 'project_created')
            data: Additional activity data
            
        Returns:
            The created activity record
        """
        activity = Activity(
            project_id=project_id,
            user_id=user_id,
            activity_type=activity_type,
            data=data
        )
        self.db.add(activity)
        await self.db.commit()
        return activity
    
    async def get_project_activities(
        self,
        project_id: str,
        limit: int = 50
    ) -> List[Activity]:
        """
        Get activities for a project.
        
        Args:
            project_id: ID of the project
            limit: Maximum number of activities to return
            
        Returns:
            List of activities ordered by creation time (newest first)
        """
        result = await self.db.execute(
            select(Activity)
            .where(Activity.project_id == project_id)
            .order_by(desc(Activity.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())


async def log_activity(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    activity_type: str,
    data: Dict[str, Any]
) -> None:
    """
    Convenience function for logging activity.
    Maintains backward compatibility with original main.py function.
    
    Args:
        db: Database session
        project_id: ID of the project
        user_id: ID of the user
        activity_type: Type of activity
        data: Additional activity data
    """
    service = ActivityService(db)
    await service.log(project_id, user_id, activity_type, data)
