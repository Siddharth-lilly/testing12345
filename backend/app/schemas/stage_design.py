# app/schemas/stage_design.py - Design stage schemas
"""
Pydantic schemas for the Design stage.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DesignConstraints(BaseModel):
    """Constraints and preferences for architecture generation."""
    preferred_tech_stack: Optional[List[str]] = None
    cloud_provider: Optional[str] = None  # aws, azure, gcp, on-premise
    budget_range: Optional[str] = None  # low, medium, high
    timeline_weeks: Optional[int] = None
    compliance_requirements: Optional[List[str]] = None  # hipaa, gdpr, sox, pci-dss
    scalability_needs: Optional[str] = None  # low, medium, high, enterprise
    team_expertise: Optional[List[str]] = None
    existing_systems: Optional[List[str]] = None
    additional_notes: Optional[str] = None


class UploadedFile(BaseModel):
    """Schema for uploaded file content."""
    name: str
    content: str


class DesignGenerateRequest(BaseModel):
    """Request schema for generating architecture options."""
    project_id: str
    constraints: Optional[DesignConstraints] = None
    uploaded_files: Optional[List[Dict[str, str]]] = None  # [{name, content}]
    created_by: Optional[str] = None


class SelectArchitectureRequest(BaseModel):
    """Request schema for selecting an architecture option."""
    project_id: str
    selected_option_id: str  # option_1, option_2, option_3
    options_data: Dict[str, Any]  # Full options data from generation
    created_by: Optional[str] = None


class DesignGenerateResponse(BaseModel):
    """Response schema for design generation."""
    status: str
    message: str
    data: Dict[str, Any]


class SelectArchitectureResponse(BaseModel):
    """Response schema for architecture selection."""
    status: str
    message: str
    architecture: Dict[str, Any]
    next_stage: str
