# app/api/v1/define.py
"""
Define stage endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.stage_define import DefineGenerateRequest
from app.services.define_service import DefineService

router = APIRouter(prefix="/stages/define", tags=["Define Stage"])


@router.post("/generate")
async def generate_define_stage(
    request: DefineGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    DEFINE STAGE: Generate BRD and User Stories.
    
    This stage takes the outputs from Discover stage and generates:
    1. A comprehensive Business Requirements Document (BRD)
    2. User Stories based on the BRD
    
    **IMPORTANT**: All chat history from Discover and Define stages is automatically
    included as context for generation. The AI will incorporate all details
    discussed in chat into the generated documents.
    
    Prerequisites:
    - Problem Statement artifact from Discover stage (auto-fetched if ID not provided)
    - Stakeholder Analysis artifact from Discover stage (auto-fetched if ID not provided)
    
    Args:
        request: Contains project_id, optional artifact IDs from Discover stage, and optional created_by
                 If artifact IDs are not provided, they will be auto-fetched from the project.
        
    Returns:
        Dictionary containing BRD and User Stories artifacts with chat_messages_used count
    """
    service = DefineService(db)
    
    try:
        result = await service.generate_define_stage(
            project_id=request.project_id,
            problem_statement_artifact_id=request.problem_statement_artifact_id,
            stakeholder_analysis_artifact_id=request.stakeholder_analysis_artifact_id,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"❌ Error in define stage: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Define stage failed: {str(e)}")