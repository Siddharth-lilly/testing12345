# app/schemas/artifact.py - Artifact schemas
"""
Pydantic schemas for Artifact-related requests and responses.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import StageType, ArtifactType


class ArtifactResponse(BaseModel):
    """Schema for artifact response."""
    model_config = ConfigDict(from_attributes=True)
    
    artifact_id: str
    project_id: str
    stage: StageType
    artifact_type: ArtifactType
    name: str
    content: str
    version: int
    created_at: str
    created_by: str
    meta_data: Optional[Dict[str, Any]] = Field(default=None, alias="metadata")
    
    @field_validator('artifact_id', 'project_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v


class ArtifactListResponse(BaseModel):
    """Schema for listing artifacts."""
    project_id: str
    count: int
    artifacts: List[Dict[str, Any]]


class ArtifactCreate(BaseModel):
    """Schema for creating an artifact."""
    project_id: str
    stage: StageType
    artifact_type: ArtifactType
    name: str
    content: str
    created_by: str = "system"
    meta_data: Optional[Dict[str, Any]] = None


class RegenerateRequest(BaseModel):
    """Schema for regenerating an artifact based on feedback."""
    artifact_id: str
    feedback: str = Field(..., description="User's feedback on why they want to regenerate")
    created_by: Optional[str] = None


class GenerationStatus(BaseModel):
    """Schema for tracking generation status."""
    task_id: str
    status: str
    progress: int
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
