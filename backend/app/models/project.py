# app/models/project.py - Project model
"""
Project model representing an SDLC project.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.enums import StageType


class Project(Base):
    """
    Represents a software development project in SDLC Studio.
    
    Attributes:
        id: Unique project identifier
        name: Project name
        description: Project description
        created_by: User who created the project
        created_at: Creation timestamp
        updated_at: Last update timestamp
        current_stage: Current SDLC stage
        stages_config: JSON configuration for stages (includes GitHub config)
    """
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_stage = Column(SQLEnum(StageType), default=StageType.DISCOVER)
    stages_config = Column(JSON, default=dict)
    
    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', stage={self.current_stage})>"
