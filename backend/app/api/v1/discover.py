# app/api/v1/discover.py
"""
Discover stage endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.stage_discover import DiscoverGenerateRequest
from app.services.discover_service import DiscoverService

router = APIRouter(prefix="/stages/discover", tags=["Discover Stage"])


@router.post("/generate")
async def generate_discover_stage(
    request: DiscoverGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    DISCOVER STAGE: Generate Problem Statement and Stakeholder Analysis.
    
    This is the first stage of the SDLC. Takes a user's initial idea and generates:
    1. A structured Problem Statement document
    2. A comprehensive Stakeholder Analysis
    
    **IMPORTANT**: All chat history from the Discover stage is automatically
    included as context for generation. The AI will incorporate all details
    discussed in chat into the generated documents.
    
    Args:
        request: Contains project_id, optional user_idea, and optional created_by
                 If user_idea is not provided, it will be extracted from chat history.
        
    Returns:
        Dictionary containing both generated artifacts with chat_messages_used count
    """
    service = DiscoverService(db)
    
    try:
        result = await service.generate_discover_stage(
            project_id=request.project_id,
            user_idea=request.user_idea,  # Can be None - service handles extraction
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in discover stage: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Discover stage failed: {str(e)}")