# app/schemas/stage_define.py - Define stage schemas
"""
Pydantic schemas for the Define stage.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class DefineGenerateRequest(BaseModel):
    """Request schema for generating define stage artifacts."""
    project_id: str
    problem_statement_artifact_id: Optional[str] = Field(
        None,
        description="ID of the problem statement artifact. If not provided, will be auto-fetched from project."
    )
    stakeholder_analysis_artifact_id: Optional[str] = Field(
        None,
        description="ID of the stakeholder analysis artifact. If not provided, will be auto-fetched from project."
    )
    created_by: Optional[str] = None


class BRDGenerateRequest(BaseModel):
    """Request schema for generating BRD only."""
    project_id: str
    prompt: str = Field(..., description="Project description")
    created_by: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class UserStoriesGenerateRequest(BaseModel):
    """Request schema for generating user stories."""
    project_id: str
    brd_content: str
    brd_artifact_id: Optional[str] = None
    epic_name: Optional[str] = "Main Features"
    created_by: Optional[str] = None


class DefineArtifactResponse(BaseModel):
    """Response schema for a single define artifact."""
    artifact_id: str
    content: str
    created_at: str
    meta_data: Optional[Dict[str, Any]] = None


class DefineResponse(BaseModel):
    """Response schema for define stage generation."""
    status: str
    message: str
    chat_messages_used: int = 0
    brd: DefineArtifactResponse
    user_stories: Dict[str, Any]