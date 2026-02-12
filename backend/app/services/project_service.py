# app/services/project_service.py - Project management service
"""
Service for project CRUD operations and management.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.enums import StageType
from app.services.base import BaseService
from app.services.activity_service import log_activity
from app.utils.converters import project_to_dict


class ProjectService(BaseService[Project]):
    """Service for managing projects."""
    
    model = Project
    
    async def create_project(
        self,
        name: str,
        description: str,
        created_by: str
    ) -> Project:
        """
        Create a new project with default stage configuration.
        
        Args:
            name: Project name
            description: Project description
            created_by: Creator's identifier
            
        Returns:
            The created project
        """
        project = Project(
            name=name,
            description=description,
            created_by=created_by,
            current_stage=StageType.DISCOVER,
            stages_config={
                "discover": {"status": "active", "order": 1},
                "define": {"status": "pending", "order": 2},
                "design": {"status": "pending", "order": 3},
                "develop": {"status": "pending", "order": 4},
                "test": {"status": "pending", "order": 5},
                "build": {"status": "pending", "order": 6},
                "deploy": {"status": "pending", "order": 7}
            }
        )
        
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        
        # Log activity
        await log_activity(
            self.db,
            str(project.id),
            created_by,
            "project_created",
            {"project_name": project.name}
        )
        
        return project
    
    async def get_project(self, project_id: UUID) -> Optional[Project]:
        """
        Get a project by ID.
        
        Args:
            project_id: UUID of the project
            
        Returns:
            The project if found, None otherwise
        """
        result = await self.db.execute(
            select(Project).where(Project.id == project_id)
        )
        return result.scalar_one_or_none()
    
    async def list_projects(
        self,
        skip: int = 0,
        limit: int = 50
    ) -> List[Project]:
        """
        List all projects with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of projects ordered by creation time (newest first)
        """
        result = await self.db.execute(
            select(Project)
            .order_by(desc(Project.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update_stage(
        self,
        project: Project,
        new_stage: StageType
    ) -> Project:
        """
        Update the project's current stage.
        
        Args:
            project: The project to update
            new_stage: The new stage to set
            
        Returns:
            The updated project
        """
        project.current_stage = new_stage
        await self.db.commit()
        await self.db.refresh(project)
        return project
    
    async def update_stages_config(
        self,
        project: Project,
        stages_config: Dict[str, Any]
    ) -> Project:
        """
        Update the project's stages configuration.
        
        Args:
            project: The project to update
            stages_config: The new stages configuration
            
        Returns:
            The updated project
        """
        from sqlalchemy.orm.attributes import flag_modified
        
        project.stages_config = stages_config
        flag_modified(project, "stages_config")
        await self.db.commit()
        await self.db.refresh(project)
        return project
    
    def to_dict(self, project: Project) -> Dict[str, Any]:
        """Convert project to dictionary representation."""
        return project_to_dict(project)
