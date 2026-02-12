# app/schemas/project.py - Project schemas
"""
Pydantic schemas for Project-related requests and responses.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import StageType


class ProjectCreate(BaseModel):
    """Schema for creating a new project."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="")
    created_by: str = Field(default="user@example.com")


class ProjectResponse(BaseModel):
    """Schema for project response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime
    current_stage: StageType
    stages_config: Dict[str, Any]
    
    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    current_stage: Optional[StageType] = None
    stages_config: Optional[Dict[str, Any]] = None
