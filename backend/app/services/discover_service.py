# app/services/discover_service.py - Discover stage service
"""
Service for the Discover stage - Problem Statement and Stakeholder Analysis generation.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.enums import StageType, ArtifactType
from app.services.ai_service import generate_with_openai
from app.services.activity_service import log_activity
from app.prompts import PROBLEM_STATEMENT_PROMPT, STAKEHOLDER_ANALYSIS_PROMPT
from app.utils.chat_context import (
    get_chat_history_for_stage,
    format_chat_history_for_prompt,
    count_chat_messages
)


class DiscoverService:
    """Service for Discover stage operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _extract_user_idea_from_chat(self, chat_history: List[Dict[str, str]]) -> str:
        """
        Extract the user's initial idea from chat history.
        Combines all user messages to form a comprehensive idea description.
        
        Args:
            chat_history: List of chat messages
            
        Returns:
            Combined user messages as the project idea
        """
        if not chat_history:
            return "Project idea not specified. Generate based on available context."
        
        user_messages = [msg["content"] for msg in chat_history if msg["role"] == "user"]
        
        if not user_messages:
            return "Project idea not specified. Generate based on available context."
        
        # Combine all user messages with context markers
        combined_idea = "The user discussed the following about their project:\n\n"
        for i, msg in enumerate(user_messages, 1):
            combined_idea += f"[Message {i}]: {msg}\n\n"
        
        return combined_idea
    
    async def generate_discover_stage(
        self,
        project_id: str,
        user_idea: Optional[str] = None,
        created_by: str = "AI Business Analyst"
    ) -> Dict[str, Any]:
        """
        Generate Problem Statement and Stakeholder Analysis for the Discover stage.
        
        Args:
            project_id: ID of the project
            user_idea: User's initial idea/statement (optional - extracted from chat if not provided)
            created_by: Creator identifier
            
        Returns:
            Dictionary containing both artifacts and status
        """
        # Get project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Fetch chat history for discover stage - THIS IS CRITICAL
        chat_history = await get_chat_history_for_stage(
            self.db, project_id, StageType.DISCOVER, limit=100
        )
        
        message_count = len(chat_history)
        
        # If no user_idea provided, extract from chat history
        if not user_idea or user_idea.strip() == "":
            user_idea = self._extract_user_idea_from_chat(chat_history)
            print(f"📝 Extracted user idea from {message_count} chat messages")
        
        # Format chat history for prompt with strong emphasis
        chat_context = ""
        if chat_history:
            chat_context = "\n\n" + "=" * 60
            chat_context += "\n## 💬 CONVERSATION CONTEXT (CRITICAL - USE THIS!)\n"
            chat_context += "=" * 60 + "\n"
            chat_context += "**IMPORTANT**: The following conversation contains SPECIFIC details that MUST be incorporated:\n"
            chat_context += "- Project requirements and features discussed\n"
            chat_context += "- Stakeholders mentioned\n"
            chat_context += "- Constraints and priorities stated\n"
            chat_context += "- Technical preferences mentioned\n"
            chat_context += "- Business rules and edge cases\n\n"
            chat_context += format_chat_history_for_prompt(
                chat_history, 
                "Discovery Discussion",
                include_header=False
            )
            chat_context += "\n" + "=" * 60
            chat_context += "\n**INSTRUCTION: Extract and incorporate ALL relevant details from above into the document.**\n"
            chat_context += "**If the user mentioned specific features, stakeholders, constraints, or requirements - they MUST appear in the output.**\n"
            chat_context += "=" * 60 + "\n"
        
        print(f"📝 Generating Problem Statement for project: {project.name}")
        print(f"   └── Chat context: {message_count} messages from Discover stage")
        
        # Step 1: Generate Problem Statement with chat context
        problem_prompt = PROBLEM_STATEMENT_PROMPT.format(user_idea=user_idea)
        
        # Enrich user message with chat history context
        enriched_user_message = f"Generate a comprehensive Problem Statement for:\n\n{user_idea}{chat_context}"
        
        problem_content = await generate_with_openai(problem_prompt, enriched_user_message, max_tokens=3000)
        
        problem_artifact = Artifact(
            project_id=project_id,
            stage=StageType.DISCOVER,
            artifact_type=ArtifactType.PROBLEM_STATEMENT,
            name="Problem Statement",
            content=problem_content,
            version=1,
            created_by=created_by,
            meta_data={
                "original_idea": user_idea[:500],  # Limit stored idea length
                "model": "gpt-4o-mini",
                "artifact_subtype": "problem_statement",
                "chat_messages_used": message_count,
                "generation_context": "includes_chat_history" if message_count > 0 else "no_chat_history",
                "idea_source": "chat_history" if message_count > 0 and (not user_idea or "user discussed" in user_idea) else "provided"
            }
        )
        
        self.db.add(problem_artifact)
        await self.db.flush()
        
        # Step 2: Generate Stakeholder Analysis with chat context
        print(f"📝 Generating Stakeholder Analysis...")
        print(f"   └── Chat context: {message_count} messages from Discover stage")
        
        stakeholder_prompt = STAKEHOLDER_ANALYSIS_PROMPT.format(
            user_idea=user_idea,
            problem_statement=problem_content
        )
        
        # Include chat context for stakeholder analysis too
        stakeholder_user_message = f"Generate comprehensive Stakeholder Analysis based on the context provided.{chat_context}"
        
        stakeholder_content = await generate_with_openai(
            stakeholder_prompt,
            stakeholder_user_message,
            max_tokens=3000
        )
        
        stakeholder_artifact = Artifact(
            project_id=project_id,
            stage=StageType.DISCOVER,
            artifact_type=ArtifactType.STAKEHOLDER_ANALYSIS,
            name="Stakeholder Analysis",
            content=stakeholder_content,
            version=1,
            created_by=created_by,
            meta_data={
                "original_idea": user_idea[:500],
                "model": "gpt-4o-mini",
                "artifact_subtype": "stakeholder_analysis",
                "problem_statement_id": str(problem_artifact.id),
                "chat_messages_used": message_count,
                "generation_context": "includes_chat_history" if message_count > 0 else "no_chat_history"
            }
        )
        
        self.db.add(stakeholder_artifact)
        
        # Create commit
        commit = Commit(
            project_id=project_id,
            stage=StageType.DISCOVER,
            author_id=created_by,
            message=f"Generated Problem Statement and Stakeholder Analysis (with {message_count} chat messages for context)",
            changes={
                "added": ["Problem Statement", "Stakeholder Analysis"],
                "modified": [],
                "deleted": []
            }
        )
        self.db.add(commit)
        
        # Log activity
        await log_activity(
            self.db,
            project_id,
            created_by or "system",
            "discover_completed",
            {
                "user_idea": user_idea[:100],
                "artifacts_generated": 2,
                "chat_messages_used": message_count
            }
        )
        
        # Update project stage
        project.current_stage = StageType.DEFINE
        
        await self.db.commit()
        await self.db.refresh(problem_artifact)
        await self.db.refresh(stakeholder_artifact)
        
        print(f"✅ Discover stage completed for project: {project.name}")
        print(f"   └── Used {message_count} chat messages for context")
        
        return {
            "status": "completed",
            "message": f"Discover stage completed successfully (used {message_count} chat messages for context)",
            "chat_messages_used": message_count,
            "problem_statement": {
                "artifact_id": str(problem_artifact.id),
                "content": problem_artifact.content,
                "created_at": problem_artifact.created_at.isoformat(),
                "meta_data": problem_artifact.meta_data
            },
            "stakeholder_analysis": {
                "artifact_id": str(stakeholder_artifact.id),
                "content": stakeholder_artifact.content,
                "created_at": stakeholder_artifact.created_at.isoformat(),
                "meta_data": stakeholder_artifact.meta_data
            }
        }