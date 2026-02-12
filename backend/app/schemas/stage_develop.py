# app/schemas/stage_develop.py - Develop stage schemas
"""
Pydantic schemas for the Develop stage (tickets and implementation).
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DevelopTicket(BaseModel):
    """A single development ticket."""
    key: str  # e.g., "DEV-101"
    type: str  # "frontend", "backend", "api", "database", "integration"
    summary: str
    description: str
    acceptance_criteria: List[str]
    tech_stack: List[str]
    priority: str  # "High", "Medium", "Low"
    estimated_hours: int
    dependencies: List[str] = []  # Other ticket keys this depends on
    status: str = "todo"  # "todo", "in_progress", "done"


class GenerateTicketsRequest(BaseModel):
    """Request schema for generating development tickets."""
    project_id: str
    created_by: Optional[str] = "user"


class GenerateTicketsResponse(BaseModel):
    """Response schema for ticket generation."""
    status: str
    message: str
    artifact_id: str
    tickets: List[Dict[str, Any]]
    summary: Dict[str, Any]


class UpdateTicketStatusRequest(BaseModel):
    """Request schema for updating ticket status."""
    status: str  # "todo", "in_progress", "done"


class StartImplementationRequest(BaseModel):
    """Request schema for starting ticket implementation."""
    project_id: str
    ticket_key: str


class GetTicketsResponse(BaseModel):
    """Response schema for getting tickets."""
    status: str
    artifact_id: Optional[str] = None
    tickets: List[Dict[str, Any]]
    summary: Dict[str, Any]
    generated_at: Optional[str] = None


class UpdateTicketStatusResponse(BaseModel):
    """Response schema for updating ticket status."""
    status: str
    ticket_key: str
    new_status: str
    ticket: Dict[str, Any]


class ImplementTicketRequest(BaseModel):
    """Request schema for implementing a ticket."""
    project_id: str
    ticket_key: str
    created_by: Optional[str] = "user"


class ImplementationResult(BaseModel):
    """Response schema for ticket implementation."""
    status: str
    ticket_key: str
    branch_name: Optional[str] = None
    issue_number: Optional[int] = None
    issue_url: Optional[str] = None
    pr_number: Optional[int] = None
    pr_url: Optional[str] = None
    files_created: List[str] = []
    commit_sha: Optional[str] = None
    summary: Optional[str] = None
    error: Optional[str] = None
