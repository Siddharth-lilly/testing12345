# app/schemas/stage_discover.py - Discover stage schemas
"""
Pydantic schemas for the Discover stage.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class DiscoverGenerateRequest(BaseModel):
    """Request schema for generating discover stage artifacts."""
    project_id: str
    user_idea: Optional[str] = Field(
        None, 
        description="User's initial idea/statement. If not provided, will be extracted from chat history."
    )
    created_by: Optional[str] = None


class DiscoverArtifactResponse(BaseModel):
    """Response schema for a single discover artifact."""
    artifact_id: str
    content: str
    created_at: str
    meta_data: Optional[Dict[str, Any]] = None


class DiscoverResponse(BaseModel):
    """Response schema for discover stage generation."""
    status: str
    message: str
    chat_messages_used: int = 0
    problem_statement: DiscoverArtifactResponse
    stakeholder_analysis: DiscoverArtifactResponse