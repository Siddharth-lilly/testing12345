# app/api/v1/develop.py
"""
Develop stage endpoints - Ticket generation and implementation.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.stage_develop import (
    GenerateTicketsRequest,
    UpdateTicketStatusRequest,
    StartImplementationRequest,
    ImplementTicketRequest,
)
from app.services.develop_service import DevelopService

router = APIRouter(prefix="/stages/develop", tags=["Develop Stage"])


@router.post("/generate-tickets")
async def generate_tickets(
    request: GenerateTicketsRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    DEVELOP STAGE: Generate development tickets from all project artifacts.
    
    Analyzes all previous stage outputs (Problem Statement, BRD, User Stories,
    Architecture) and generates a prioritized list of development tickets.
    
    Each ticket includes:
    - Unique key (DEV-XXX)
    - Type (feature, bug, task, spike)
    - Priority (high, medium, low)
    - Description and acceptance criteria
    - Tech stack and dependencies
    - Estimated hours
    
    Requires:
    - GitHub must be configured first
    - Architecture artifact must exist
    
    Args:
        request: Contains project_id and optional created_by
        
    Returns:
        Dictionary containing generated tickets and summary
    """
    service = DevelopService(db)
    
    try:
        result = await service.generate_tickets(
            project_id=request.project_id,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating tickets: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ticket generation failed: {str(e)}")


@router.get("/{project_id}/tickets")
async def get_tickets(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get existing development tickets for a project.
    
    Args:
        project_id: ID of the project
        
    Returns:
        Dictionary containing tickets and summary, or empty if not generated
    """
    service = DevelopService(db)
    return await service.get_tickets(project_id)


@router.put("/{project_id}/tickets/{ticket_key}/status")
async def update_ticket_status(
    project_id: str,
    ticket_key: str,
    request: UpdateTicketStatusRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a ticket's status.
    
    Args:
        project_id: ID of the project
        ticket_key: Ticket key (e.g., "DEV-101")
        request: Contains new status (todo, in_progress, done)
        
    Returns:
        Dictionary containing updated ticket
    """
    service = DevelopService(db)
    return await service.update_ticket_status(
        project_id=project_id,
        ticket_key=ticket_key,
        status=request.status
    )


@router.post("/start-implementation")
async def start_implementation(
    request: StartImplementationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Start implementing a ticket - updates status and returns context.
    
    Args:
        request: Contains project_id and ticket_key
        
    Returns:
        Dictionary containing ticket details and GitHub info
    """
    service = DevelopService(db)
    return await service.start_implementation(
        project_id=request.project_id,
        ticket_key=request.ticket_key
    )


@router.post("/implement")
async def implement_ticket(
    request: ImplementTicketRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Full ticket implementation workflow.
    
    This is the main endpoint for automated code generation and PR creation.
    The workflow:
    1. Creates a feature branch from default branch
    2. Creates a GitHub Issue for the ticket
    3. Generates code using AI based on ticket and architecture
    4. Commits generated files to the feature branch
    5. Creates a Pull Request
    6. Links the PR to the Issue
    
    Requires:
    - GitHub must be configured with valid credentials
    - Tickets must be generated
    - Architecture document must exist
    
    Args:
        request: Contains project_id, ticket_key, and optional created_by
        
    Returns:
        Dictionary containing implementation results (branch, issue, PR, files)
    """
    service = DevelopService(db)
    
    try:
        result = await service.implement_ticket(
            project_id=request.project_id,
            ticket_key=request.ticket_key,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error implementing ticket: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Implementation failed: {str(e)}")
