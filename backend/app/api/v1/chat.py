# app/api/v1/chat.py
"""
Chat endpoints for AI Specialist conversations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.chat import ChatMessageRequest
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/send")
async def send_chat_message(
    request: ChatMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to the AI Specialist and get a response.
    
    The AI Specialist is context-aware and changes persona based on
    the current stage:
    - DISCOVER: Business Analyst
    - DEFINE: Requirements Analyst
    - DESIGN: Solution Architect
    - DEVELOP: Senior Developer
    - TEST: QA Engineer
    - DEPLOY: DevOps Engineer
    - MAINTAIN: Support Engineer
    
    The conversation history is maintained per project/stage combination.
    
    Args:
        request: Contains project_id, stage, message, and optional created_by
        
    Returns:
        Dictionary containing AI response and conversation metadata
    """
    service = ChatService(db)
    
    try:
        result = await service.send_message(
            project_id=request.project_id,
            stage=request.stage,
            message=request.message
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/{project_id}/{stage}/history")
async def get_chat_history(
    project_id: str,
    stage: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Get chat history for a project and stage.
    
    Args:
        project_id: ID of the project
        stage: SDLC stage (discover, define, design, develop, test, deploy, maintain)
        limit: Maximum number of messages to return (default 50)
        
    Returns:
        Dictionary containing chat messages
    """
    service = ChatService(db)
    result = await service.get_history(
        project_id=project_id,
        stage=stage,
        limit=limit
    )
    return result


@router.delete("/{project_id}/{stage}/history")
async def clear_chat_history(
    project_id: str,
    stage: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Clear chat history for a project and stage.
    
    Args:
        project_id: ID of the project
        stage: SDLC stage
        
    Returns:
        Dictionary confirming deletion
    """
    service = ChatService(db)
    result = await service.clear_history(
        project_id=project_id,
        stage=stage
    )
    return result