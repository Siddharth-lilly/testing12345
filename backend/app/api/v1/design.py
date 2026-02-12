# app/api/v1/design.py
"""
Design stage endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.stage_design import DesignGenerateRequest, SelectArchitectureRequest
from app.services.design_service import DesignService

router = APIRouter(prefix="/stages/design", tags=["Design Stage"])


@router.post("/generate")
async def generate_design(
    request: DesignGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    DESIGN STAGE: Generate 3 Solution Architecture Options.
    
    This stage analyzes all previous artifacts and generates three
    architecture options for the user to choose from:
    1. Conservative option (lower risk, proven technologies)
    2. Balanced option (moderate complexity, good trade-offs)
    3. Innovative option (cutting-edge, higher risk/reward)
    
    Each option includes:
    - Tech stack recommendations
    - Architecture diagrams (Mermaid)
    - Cost estimates
    - Timeline estimates
    - Risk assessment
    
    Args:
        request: Contains project_id, optional constraints, and uploaded files
        
    Returns:
        Dictionary containing three architecture options with analysis
    """
    service = DesignService(db)
    
    try:
        result = await service.generate_architecture_options(
            project_id=request.project_id,
            constraints=request.constraints,          # <-- keep as DesignConstraints
            uploaded_files=request.uploaded_files
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in design stage: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Design stage failed: {str(e)}")


@router.post("/select")
async def select_architecture(
    request: SelectArchitectureRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Select an architecture option and create the Architecture Document artifact.
    
    After the user reviews the three options, they select one.
    This endpoint creates a comprehensive Architecture Document based on
    the selected option.
    
    Args:
        request: Contains project_id, selected_option_id, options_data, and optional created_by
        
    Returns:
        Dictionary containing the created Architecture artifact
    """
    service = DesignService(db)
    
    try:
        result = await service.select_architecture(
            project_id=request.project_id,
            selected_option_id=request.selected_option_id,
            options_data=request.options_data,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error selecting architecture: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Architecture selection failed: {str(e)}")
