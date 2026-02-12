# app/services/artifact_service.py - Artifact management service
"""
Service for artifact CRUD operations and regeneration.
Enhanced with chat history context for all artifact types.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.enums import StageType, ArtifactType
from app.services.base import BaseService
from app.services.ai_service import generate_with_openai
from app.services.activity_service import log_activity
from app.prompts import (
    PROBLEM_STATEMENT_PROMPT, 
    STAKEHOLDER_ANALYSIS_PROMPT,
)
from app.utils.converters import artifact_to_dict
from app.utils.chat_context import (
    get_chat_history_for_stage,
    format_all_chat_history_for_prompt,
    get_all_chat_history,
)


# ============================================================================
# REGENERATION PROMPTS - Used when user provides feedback to improve artifacts
# ============================================================================

REGENERATE_PROBLEM_STATEMENT_PROMPT = """You are a Business Analyst AI Specialist regenerating a Problem Statement.

## YOUR TASK
The user has reviewed the existing Problem Statement and provided feedback for improvements.
You must regenerate the document incorporating their feedback while keeping all good parts intact.

## ORIGINAL DOCUMENT
{original_content}

## USER FEEDBACK / ENHANCEMENT REQUEST
{feedback}

## CONVERSATION CONTEXT (CRITICAL - USE THIS!)
{chat_context}

## INSTRUCTIONS
1. CAREFULLY read the user's feedback - they may want to ADD sections, MODIFY content, or REMOVE parts
2. Keep the same document structure unless the feedback requests changes
3. Incorporate ALL relevant details from the conversation context
4. If the user mentions specific requirements (e.g., "add legal requirements"), add a proper section for it
5. Preserve all good content from the original that wasn't mentioned in the feedback
6. Use the same markdown formatting style

Generate the COMPLETE improved Problem Statement now (not a diff, the full document):"""


REGENERATE_STAKEHOLDER_PROMPT = """You are a Business Analyst AI Specialist regenerating a Stakeholder Analysis.

## YOUR TASK
The user has reviewed the existing Stakeholder Analysis and provided feedback for improvements.
You must regenerate the document incorporating their feedback.

## ORIGINAL DOCUMENT
{original_content}

## USER FEEDBACK / ENHANCEMENT REQUEST
{feedback}

## CONVERSATION CONTEXT (CRITICAL - USE THIS!)
{chat_context}

## INSTRUCTIONS
1. CAREFULLY address the user's specific feedback
2. Add any new stakeholders mentioned in conversations or feedback
3. Update roles, interests, or engagement strategies as requested
4. Keep all accurate stakeholder information from the original
5. Maintain the table/matrix format

Generate the COMPLETE improved Stakeholder Analysis now:"""


REGENERATE_BRD_PROMPT = """You are a Business Analyst AI Specialist regenerating a Business Requirements Document (BRD).

## YOUR TASK
The user has reviewed the existing BRD and provided feedback for improvements.
You must regenerate the document incorporating their feedback.

## ORIGINAL DOCUMENT
{original_content}

## USER FEEDBACK / ENHANCEMENT REQUEST  
{feedback}

## CONVERSATION CONTEXT (CRITICAL - USE THIS!)
{chat_context}

## INSTRUCTIONS
1. CAREFULLY address the user's specific feedback
2. If they request a NEW SECTION (e.g., "add legal requirements section"), create it with:
   - Appropriate heading level
   - Detailed content based on conversation context
   - Proper placement in the document structure
3. If they want to MODIFY existing content, update it while preserving accurate parts
4. Incorporate ALL requirements mentioned in conversations
5. Maintain professional BRD formatting with:
   - Clear section headers
   - Numbered requirements where appropriate
   - Tables for complex data
   - Traceability to business needs

## COMMON SECTION REQUESTS AND HOW TO HANDLE THEM
- "Legal requirements" → Add section covering compliance, regulations, legal constraints
- "Security requirements" → Add section on authentication, authorization, data protection
- "Performance requirements" → Add section on response times, throughput, scalability
- "Integration requirements" → Add section on APIs, external systems, data flows
- "Reporting requirements" → Add section on reports, dashboards, analytics needs

Generate the COMPLETE improved BRD now:"""


REGENERATE_USER_STORIES_PROMPT = """You are a Technical Writer AI Specialist regenerating User Stories.

## YOUR TASK
The user has reviewed the existing User Stories and provided feedback for improvements.
You must regenerate the stories incorporating their feedback.

## ORIGINAL DOCUMENT
{original_content}

## USER FEEDBACK / ENHANCEMENT REQUEST
{feedback}

## CONVERSATION CONTEXT (CRITICAL - USE THIS!)
{chat_context}

## INSTRUCTIONS
1. Address the user's specific feedback
2. Add new user stories if mentioned in feedback or conversations
3. Refine acceptance criteria to be more specific and testable
4. Keep the standard format: "As a [role], I want [feature], so that [benefit]"
5. Include story points and priority if in the original
6. Group stories by epic/feature area

Generate the COMPLETE improved User Stories document now:"""


REGENERATE_ARCHITECTURE_PROMPT = """You are a Solutions Architect AI Specialist regenerating an Architecture Document.

## YOUR TASK
The user has reviewed the existing Architecture and provided feedback for improvements.
You must regenerate the document incorporating their feedback.

## ORIGINAL DOCUMENT
{original_content}

## USER FEEDBACK / ENHANCEMENT REQUEST
{feedback}

## CONVERSATION CONTEXT (CRITICAL - USE THIS!)
{chat_context}

## INSTRUCTIONS
1. Address the user's specific technical feedback
2. Update diagrams descriptions if architecture changes
3. Add new components, services, or integrations as requested
4. Update technology choices if the user has preferences
5. Ensure consistency between all architecture sections
6. Include:
   - System context
   - Component/service breakdown
   - Data flows
   - Technology stack
   - Infrastructure considerations
   - Security architecture

Generate the COMPLETE improved Architecture Document now:"""


REGENERATE_GENERIC_PROMPT = """You are an AI Specialist regenerating a document based on user feedback.

## YOUR TASK
The user has reviewed the existing document and provided feedback for improvements.
You must regenerate the document incorporating their feedback.

## DOCUMENT TYPE: {artifact_type}

## ORIGINAL DOCUMENT
{original_content}

## USER FEEDBACK / ENHANCEMENT REQUEST
{feedback}

## CONVERSATION CONTEXT
{chat_context}

## INSTRUCTIONS
1. CAREFULLY address the user's specific feedback
2. If they request new sections or content, add it appropriately
3. Preserve all accurate and relevant content from the original
4. Maintain consistent formatting with the original document style
5. Incorporate any relevant details from the conversation context

Generate the COMPLETE improved document now:"""


class ArtifactService(BaseService[Artifact]):
    """Service for managing artifacts with enhanced regeneration."""
    
    model = Artifact
    
    async def get_artifact(self, artifact_id: UUID) -> Optional[Artifact]:
        """Get an artifact by ID."""
        result = await self.db.execute(
            select(Artifact).where(Artifact.id == artifact_id)
        )
        return result.scalar_one_or_none()
    
    async def list_project_artifacts(
        self,
        project_id: str,
        stage: Optional[StageType] = None,
        artifact_type: Optional[ArtifactType] = None
    ) -> List[Artifact]:
        """
        List artifacts for a project with optional filters.
        """
        query = select(Artifact).where(Artifact.project_id == project_id)
        
        if stage:
            query = query.where(Artifact.stage == stage)
        
        if artifact_type:
            query = query.where(Artifact.artifact_type == artifact_type)
        
        query = query.order_by(desc(Artifact.created_at))
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_stage_artifacts(
        self,
        project_id: str,
        stage: StageType
    ) -> List[Artifact]:
        """Get all artifacts for a specific stage."""
        result = await self.db.execute(
            select(Artifact)
            .where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == stage
                )
            )
            .order_by(desc(Artifact.created_at))
        )
        return list(result.scalars().all())
    
    async def get_latest_artifact_by_type(
        self,
        project_id: str,
        artifact_type: ArtifactType
    ) -> Optional[Artifact]:
        """Get the most recent artifact of a specific type."""
        result = await self.db.execute(
            select(Artifact)
            .where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.artifact_type == artifact_type
                )
            )
            .order_by(desc(Artifact.version), desc(Artifact.created_at))
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def create_artifact(
        self,
        project_id: str,
        stage: StageType,
        artifact_type: ArtifactType,
        name: str,
        content: str,
        created_by: str,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> Artifact:
        """Create a new artifact."""
        artifact = Artifact(
            project_id=project_id,
            stage=stage,
            artifact_type=artifact_type,
            name=name,
            content=content,
            version=1,
            created_by=created_by,
            meta_data=meta_data or {}
        )
        
        self.db.add(artifact)
        await self.db.flush()
        return artifact
    
    def _get_stage_for_artifact_type(self, artifact_type: ArtifactType) -> StageType:
        """Map artifact type to its SDLC stage for fetching relevant chat history."""
        stage_mapping = {
            # Discover
            ArtifactType.PROBLEM_STATEMENT: StageType.DISCOVER,
            ArtifactType.STAKEHOLDER_ANALYSIS: StageType.DISCOVER,
            # Define
            ArtifactType.BRD: StageType.DEFINE,
            ArtifactType.PRD: StageType.DEFINE,
            ArtifactType.USER_STORIES: StageType.DEFINE,
            # Design
            ArtifactType.ARCHITECTURE: StageType.DESIGN,
            ArtifactType.SDD: StageType.DESIGN,
            ArtifactType.API_SPEC: StageType.DESIGN,
            ArtifactType.SOLUTION_OPTIONS: StageType.DESIGN,
            # Develop
            ArtifactType.CODE: StageType.DEVELOP,
            # Test
            ArtifactType.TEST_PLAN: StageType.TEST,
            ArtifactType.TEST_CASES: StageType.TEST,
            # Build
            ArtifactType.BUILD_CONFIG: StageType.BUILD,
            # Deploy
            ArtifactType.DEPLOYMENT: StageType.DEPLOY,
            ArtifactType.RELEASE_NOTES: StageType.DEPLOY,
        }
        return stage_mapping.get(artifact_type, StageType.DISCOVER)
    
    async def regenerate_artifact(
        self,
        artifact: Artifact,
        feedback: str,
        created_by: Optional[str] = None
    ) -> Artifact:
        """
        Regenerate an artifact based on user feedback.

        This method:
        1. Fetches chat history for context
        2. Uses the appropriate regeneration prompt based on artifact type
        3. Creates a new version that incorporates the feedback
        4. Maintains version history for traceability
        """
        print(f"🔄 Regenerating artifact: {artifact.name} (type: {artifact.artifact_type})")
        print(f"   └── User feedback: {feedback[:100]}...")

        # Determine which stage's chat history to fetch
        stage_for_chat = self._get_stage_for_artifact_type(artifact.artifact_type)

        # OPTION B: fetch dict[StageType, List[...]] so format_all_chat_history_for_prompt works
        # If you want ONLY the relevant stage, keep stages=[stage_for_chat].
        # If you want truly multi-stage context, set stages=None (or omit) to use defaults in get_all_chat_history.
        all_history = await get_all_chat_history(
            db=self.db,
            project_id=str(artifact.project_id),
            stages=[stage_for_chat],      # <- change to None to include multiple stages
            limit_per_stage=100
        )

        # Format chat context with emphasis
        chat_context = ""
        total_msgs = sum(len(msgs) for msgs in all_history.values()) if all_history else 0

        if total_msgs > 0:
            chat_context = format_all_chat_history_for_prompt(all_history)
            print(f"   └── Including {total_msgs} chat messages for context")
        else:
            chat_context = "(No conversation history available)"
            print(f"   └── No chat history found for {stage_for_chat.value} stage")

        # Select the appropriate regeneration prompt and generate
        new_content = await self._generate_regenerated_content(
            artifact=artifact,
            feedback=feedback,
            chat_context=chat_context
        )

        # Create new version
        new_version = artifact.version + 1

        # Determine new name (keep base name, update version)
        base_name = artifact.name.split(" v")[0] if " v" in artifact.name else artifact.name
        new_name = f"{base_name} v{new_version}"

        new_artifact = Artifact(
            project_id=artifact.project_id,
            stage=artifact.stage,
            artifact_type=artifact.artifact_type,
            name=new_name,
            content=new_content,
            version=new_version,
            created_by=created_by or artifact.created_by,
            meta_data={
                **(artifact.meta_data or {}),
                "regenerated_from": str(artifact.id),
                "regenerated_from_version": artifact.version,
                "user_feedback": feedback,
                "chat_messages_used": total_msgs,
                "regeneration_count": (artifact.meta_data or {}).get("regeneration_count", 0) + 1
            }
        )

        self.db.add(new_artifact)

        # Create commit for traceability
        commit = Commit(
            project_id=artifact.project_id,
            stage=artifact.stage,
            author_id=created_by or "user",
            message=f"Regenerated {base_name}: {feedback[:50]}{'...' if len(feedback) > 50 else ''}",
            changes={
                "added": [],
                "modified": [f"{base_name} (v{artifact.version} → v{new_version})"],
                "deleted": []
            }
        )
        self.db.add(commit)

        # Log activity
        await log_activity(
            self.db,
            artifact.project_id,
            created_by or "system",
            "artifact_regenerated",
            {
                "artifact_type": artifact.artifact_type.value if artifact.artifact_type else None,
                "artifact_name": base_name,
                "old_version": artifact.version,
                "new_version": new_version,
                "feedback_preview": feedback[:100],
                "chat_messages_used": total_msgs
            }
        )

        await self.db.commit()
        await self.db.refresh(new_artifact)

        print(f"✅ Regeneration complete: {new_name}")

        return new_artifact
    
    async def _generate_regenerated_content(
        self,
        artifact: Artifact,
        feedback: str,
        chat_context: str
    ) -> str:
        """Generate the regenerated content based on artifact type."""
        artifact_subtype = artifact.meta_data.get("artifact_subtype") if artifact.meta_data else None
        
        # Map to the correct prompt based on artifact type
        if artifact_subtype == "problem_statement" or artifact.artifact_type == ArtifactType.PROBLEM_STATEMENT:
            prompt = REGENERATE_PROBLEM_STATEMENT_PROMPT.format(
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate Problem Statement", max_tokens=3000)
            
        elif artifact_subtype == "stakeholder_analysis" or artifact.artifact_type == ArtifactType.STAKEHOLDER_ANALYSIS:
            prompt = REGENERATE_STAKEHOLDER_PROMPT.format(
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate Stakeholder Analysis", max_tokens=3000)
            
        elif artifact.artifact_type == ArtifactType.BRD:
            prompt = REGENERATE_BRD_PROMPT.format(
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate BRD", max_tokens=6000)
            
        elif artifact.artifact_type == ArtifactType.USER_STORIES:
            prompt = REGENERATE_USER_STORIES_PROMPT.format(
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate User Stories", max_tokens=6000)
            
        elif artifact.artifact_type in [ArtifactType.ARCHITECTURE, ArtifactType.SDD, ArtifactType.SOLUTION_OPTIONS]:
            prompt = REGENERATE_ARCHITECTURE_PROMPT.format(
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate Architecture", max_tokens=6000)
            
        elif artifact.artifact_type == ArtifactType.API_SPEC:
            prompt = REGENERATE_GENERIC_PROMPT.format(
                artifact_type="API Specification",
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate API Spec", max_tokens=6000)
            
        elif artifact.artifact_type == ArtifactType.TEST_PLAN:
            prompt = REGENERATE_GENERIC_PROMPT.format(
                artifact_type="Test Plan",
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate Test Plan", max_tokens=4000)
            
        elif artifact.artifact_type == ArtifactType.TEST_CASES:
            prompt = REGENERATE_GENERIC_PROMPT.format(
                artifact_type="Test Cases",
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate Test Cases", max_tokens=6000)
            
        else:
            # Generic fallback for any artifact type
            prompt = REGENERATE_GENERIC_PROMPT.format(
                artifact_type=artifact.artifact_type.value if artifact.artifact_type else "Document",
                original_content=artifact.content,
                feedback=feedback,
                chat_context=chat_context
            )
            return await generate_with_openai(prompt, "Regenerate Document", max_tokens=4000)
    
    def to_dict(self, artifact: Artifact) -> Dict[str, Any]:
        """Convert artifact to dictionary representation."""
        return artifact_to_dict(artifact)