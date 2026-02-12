# app/services/chat_service.py - Chat service
"""
Service for AI specialist chat functionality.
"""

from typing import Any, Dict, List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.artifact import Artifact
from app.models.chat_message import ChatMessage
from app.models.enums import StageType
from app.services.ai_service import AIService
from app.prompts import get_chat_system_prompt


class ChatService:
    """Service for AI specialist chat operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
    
    async def send_message(
        self,
        project_id: str,
        stage: str,
        message: str
    ) -> Dict[str, Any]:
        """
        Send a message to the AI specialist and get a response.
        
        Args:
            project_id: ID of the project
            stage: Current stage name
            message: User's message
            
        Returns:
            Dictionary containing user and assistant messages
        """
        # Validate project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Validate stage
        try:
            stage_enum = StageType(stage.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid stage: {stage}")
        
        # Get chat history for context
        history_result = await self.db.execute(
            select(ChatMessage)
            .where(
                and_(
                    ChatMessage.project_id == project_id,
                    ChatMessage.stage == stage_enum
                )
            )
            .order_by(ChatMessage.created_at)
            .limit(20)
        )
        history = history_result.scalars().all()
        
        # Get artifacts for this stage (for context)
        artifacts_result = await self.db.execute(
            select(Artifact)
            .where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == stage_enum
                )
            )
        )
        stage_artifacts = artifacts_result.scalars().all()
        
        # Build system prompt with context
        system_prompt = get_chat_system_prompt(stage)
        context_addition = f"\n\nProject: {project.name}\nDescription: {project.description or 'No description'}"
        if stage_artifacts:
            context_addition += f"\n\nExisting artifacts in this stage: {', '.join([a.name for a in stage_artifacts])}"
        
        full_system_prompt = system_prompt + context_addition
        
        # Build messages array for OpenAI
        messages = [{"role": "system", "content": full_system_prompt}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": message})
        
        # Save user message to DB
        user_message = ChatMessage(
            project_id=project_id,
            stage=stage_enum,
            role="user",
            content=message
        )
        self.db.add(user_message)
        
        # Call OpenAI
        assistant_content, tokens = await self.ai_service.chat(messages, max_tokens=1000)
        
        # Save assistant response to DB
        assistant_message = ChatMessage(
            project_id=project_id,
            stage=stage_enum,
            role="assistant",
            content=assistant_content,
            meta_data={
                "model": self.ai_service.model,
                "tokens": tokens
            }
        )
        self.db.add(assistant_message)
        
        await self.db.commit()
        await self.db.refresh(user_message)
        await self.db.refresh(assistant_message)
        
        return {
            "user_message": {
                "id": str(user_message.id),
                "role": "user",
                "content": user_message.content,
                "created_at": user_message.created_at.isoformat()
            },
            "assistant_message": {
                "id": str(assistant_message.id),
                "role": "assistant",
                "content": assistant_message.content,
                "created_at": assistant_message.created_at.isoformat()
            }
        }
    
    async def get_history(
        self,
        project_id: str,
        stage: str,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get chat history for a project stage.
        
        Args:
            project_id: ID of the project
            stage: Stage name
            limit: Maximum number of messages to return
            
        Returns:
            Dictionary containing chat messages
        """
        # Validate stage
        try:
            stage_enum = StageType(stage.lower())
        except ValueError:
            return {"project_id": project_id, "stage": stage, "messages": []}
        
        result = await self.db.execute(
            select(ChatMessage)
            .where(
                and_(
                    ChatMessage.project_id == project_id,
                    ChatMessage.stage == stage_enum
                )
            )
            .order_by(ChatMessage.created_at)
            .limit(limit)
        )
        messages = result.scalars().all()
        
        return {
            "project_id": project_id,
            "stage": stage,
            "messages": [
                {
                    "id": str(m.id),
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat() if m.created_at else None
                }
                for m in messages
            ]
        }
    
    async def clear_history(
        self,
        project_id: str,
        stage: str
    ) -> Dict[str, Any]:
        """
        Clear chat history for a project stage.
        
        Args:
            project_id: ID of the project
            stage: Stage name
            
        Returns:
            Dictionary containing deletion count
        """
        # Validate stage
        try:
            stage_enum = StageType(stage.lower())
        except ValueError:
            return {"deleted": 0, "project_id": project_id, "stage": stage}
        
        result = await self.db.execute(
            select(ChatMessage)
            .where(
                and_(
                    ChatMessage.project_id == project_id,
                    ChatMessage.stage == stage_enum
                )
            )
        )
        messages = result.scalars().all()
        
        count = len(messages)
        for msg in messages:
            await self.db.delete(msg)
        
        await self.db.commit()
        
        return {"deleted": count, "project_id": project_id, "stage": stage}