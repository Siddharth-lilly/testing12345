# app/services/define_service.py - Define stage service
"""
Service for the Define stage - BRD and User Stories generation.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.enums import StageType, ArtifactType
from app.services.ai_service import generate_with_openai
from app.services.activity_service import log_activity
from app.prompts import BRD_WITH_CONTEXT_PROMPT, TECH_WRITER_PROMPT
from app.utils.chat_context import (
    get_all_chat_history,
    format_all_chat_history_for_prompt,
    count_chat_messages
)


class DefineService:
    """Service for Define stage operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def _get_discover_artifacts(self, project_id: str) -> tuple:
        """
        Fetch the Problem Statement and Stakeholder Analysis artifacts from Discover stage.
        
        Args:
            project_id: ID of the project
            
        Returns:
            Tuple of (problem_artifact, stakeholder_artifact)
        """
        # Fetch all Discover stage artifacts
        result = await self.db.execute(
            select(Artifact).where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == StageType.DISCOVER
                )
            )
        )
        artifacts = result.scalars().all()
        
        problem_artifact = None
        stakeholder_artifact = None
        
        for artifact in artifacts:
            if artifact.artifact_type == ArtifactType.PROBLEM_STATEMENT:
                problem_artifact = artifact
            elif artifact.artifact_type == ArtifactType.STAKEHOLDER_ANALYSIS:
                stakeholder_artifact = artifact
        
        return problem_artifact, stakeholder_artifact
    
    async def generate_define_stage(
        self,
        project_id: str,
        problem_statement_artifact_id: Optional[str] = None,
        stakeholder_analysis_artifact_id: Optional[str] = None,
        created_by: str = "AI Business Analyst"
    ) -> Dict[str, Any]:
        """
        Generate BRD and User Stories for the Define stage.
        
        Args:
            project_id: ID of the project
            problem_statement_artifact_id: Optional ID of the problem statement artifact (auto-fetched if not provided)
            stakeholder_analysis_artifact_id: Optional ID of the stakeholder analysis artifact (auto-fetched if not provided)
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
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Auto-fetch artifacts if IDs not provided
        if not problem_statement_artifact_id or not stakeholder_analysis_artifact_id:
            print(f"📝 Auto-fetching Discover stage artifacts for project: {project.name}")
            problem_artifact, stakeholder_artifact = await self._get_discover_artifacts(project_id)
            
            if not problem_artifact:
                raise HTTPException(
                    status_code=400, 
                    detail="Problem Statement not found. Complete Discover stage first."
                )
            if not stakeholder_artifact:
                raise HTTPException(
                    status_code=400, 
                    detail="Stakeholder Analysis not found. Complete Discover stage first."
                )
        else:
            # Fetch artifacts by provided IDs
            problem_result = await self.db.execute(
                select(Artifact).where(Artifact.id == UUID(problem_statement_artifact_id))
            )
            problem_artifact = problem_result.scalar_one_or_none()
            
            if not problem_artifact:
                raise HTTPException(status_code=404, detail="Problem Statement not found")
            
            stakeholder_result = await self.db.execute(
                select(Artifact).where(Artifact.id == UUID(stakeholder_analysis_artifact_id))
            )
            stakeholder_artifact = stakeholder_result.scalar_one_or_none()
            
            if not stakeholder_artifact:
                raise HTTPException(status_code=404, detail="Stakeholder Analysis not found")
        
        # Fetch chat history from BOTH discover and define stages for comprehensive context
        all_chat_history = await get_all_chat_history(
            self.db, 
            project_id, 
            stages=[StageType.DISCOVER, StageType.DEFINE],
            limit_per_stage=75  # Get more messages for better context
        )
        
        # Format chat history with strong emphasis
        chat_context = format_all_chat_history_for_prompt(all_chat_history)
        
        # Get stats for logging
        chat_stats = count_chat_messages(all_chat_history)
        total_chat_messages = chat_stats["total_messages"]
        
        print(f"📝 Generating BRD for project: {project.name}")
        print(f"   └── Chat context: {total_chat_messages} messages from Discover + Define stages")
        for stage, count in chat_stats["by_stage"].items():
            if count > 0:
                print(f"       • {stage}: {count} messages")
        
        # Step 1: Generate BRD with comprehensive chat context
        brd_prompt = BRD_WITH_CONTEXT_PROMPT.format(
            problem_statement=problem_artifact.content,
            stakeholder_analysis=stakeholder_artifact.content
        )
        
        # Enrich user message with chat history from both stages
        enriched_brd_message = f"""Generate a comprehensive Business Requirements Document that incorporates ALL context from artifacts and conversations.

**CRITICAL**: Review the conversation history below carefully. 
- Extract EVERY specific requirement mentioned
- Include ALL business rules discussed
- Note ALL constraints and priorities stated
- Use exact terminology from conversations
- Address ALL stakeholders mentioned

{chat_context}"""
        
        brd_content = await generate_with_openai(brd_prompt, enriched_brd_message, max_tokens=8000)
        
        brd_artifact = Artifact(
            project_id=project_id,
            stage=StageType.DEFINE,
            artifact_type=ArtifactType.BRD,
            name="Business Requirements Document",
            content=brd_content,
            version=1,
            created_by=created_by,
            meta_data={
                "model": "gpt-4o-mini",
                "problem_statement_id": str(problem_artifact.id),
                "stakeholder_analysis_id": str(stakeholder_artifact.id),
                "word_count": len(brd_content.split()),
                "chat_messages_used": total_chat_messages,
                "chat_stats": chat_stats["by_stage"],
                "generation_context": "includes_chat_history" if total_chat_messages > 0 else "no_chat_history"
            }
        )
        
        self.db.add(brd_artifact)
        await self.db.flush()
        
        # Step 2: Generate User Stories with chat context
        print(f"📝 Generating User Stories from BRD...")
        print(f"   └── Chat context: {total_chat_messages} messages for enrichment")
        
        stories_prompt = TECH_WRITER_PROMPT.format(brd_content=brd_content)
        
        # Enrich with chat history to capture any specific requirements discussed
        enriched_stories_message = f"""Generate comprehensive user stories based on the BRD. 

**CRITICAL**: Also review the conversation history below.
- Include stories for EVERY feature discussed
- Use exact field names and terminology from conversations
- Capture ALL acceptance criteria mentioned
- Address ALL edge cases discussed
- Respect priorities stated by the user

{chat_context}"""
        
        stories_content = await generate_with_openai(
            stories_prompt,
            enriched_stories_message,
            max_tokens=8000
        )
        
        story_count = stories_content.count("### STORY-")
        
        stories_artifact = Artifact(
            project_id=project_id,
            stage=StageType.DEFINE,
            artifact_type=ArtifactType.USER_STORIES,
            name="User Stories - Core Features",
            content=stories_content,
            version=1,
            created_by=created_by or "AI Technical Writer",
            meta_data={
                "model": "gpt-4o-mini",
                "story_count": story_count,
                "brd_artifact_id": str(brd_artifact.id),
                "chat_messages_used": total_chat_messages,
                "chat_stats": chat_stats["by_stage"],
                "generation_context": "includes_chat_history" if total_chat_messages > 0 else "no_chat_history"
            }
        )
        
        self.db.add(stories_artifact)
        
        # Create commit
        commit = Commit(
            project_id=project_id,
            stage=StageType.DEFINE,
            author_id=created_by or "AI",
            message=f"Generated BRD and {story_count} User Stories (with {total_chat_messages} chat messages for context)",
            changes={
                "added": ["BRD", f"User Stories ({story_count})"],
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
            "define_completed",
            {
                "brd_word_count": len(brd_content.split()),
                "story_count": story_count,
                "chat_messages_used": total_chat_messages
            }
        )
        
        # Update project stage
        project.current_stage = StageType.DESIGN
        
        await self.db.commit()
        await self.db.refresh(brd_artifact)
        await self.db.refresh(stories_artifact)
        
        print(f"✅ Define stage completed for project: {project.name}")
        print(f"   └── BRD: {len(brd_content.split())} words")
        print(f"   └── User Stories: {story_count} stories")
        print(f"   └── Used {total_chat_messages} chat messages for context")
        
        return {
            "status": "completed",
            "message": f"Define stage completed successfully (used {total_chat_messages} chat messages for context)",
            "chat_messages_used": total_chat_messages,
            "brd": {
                "artifact_id": str(brd_artifact.id),
                "content": brd_artifact.content,
                "created_at": brd_artifact.created_at.isoformat(),
                "meta_data": brd_artifact.meta_data
            },
            "user_stories": {
                "artifact_id": str(stories_artifact.id),
                "content": stories_artifact.content,
                "story_count": story_count,
                "created_at": stories_artifact.created_at.isoformat(),
                "meta_data": stories_artifact.meta_data
            }
        }