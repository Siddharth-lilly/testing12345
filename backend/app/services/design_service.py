# app/services/design_service.py - Design stage service
"""
Service for the Design stage - Architecture generation and selection.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.enums import StageType, ArtifactType
from app.services.ai_service import generate_with_openai
from app.services.activity_service import log_activity
from app.prompts import DESIGN_SYSTEM_PROMPT, DESIGN_USER_PROMPT_TEMPLATE
from app.schemas.stage_design import DesignConstraints


class DesignService:
    """Service for Design stage operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def generate_architecture_options(
        self,
        project_id: str,
        constraints: Optional[DesignConstraints] = None,
        uploaded_files: Optional[List[Dict[str, str]]] = None,
        created_by: str = "AI Solution Architect"
    ) -> Dict[str, Any]:
        """
        Generate 3 architecture options for the Design stage.
        
        Args:
            project_id: ID of the project
            constraints: Optional design constraints
            uploaded_files: Optional list of uploaded file contents
            created_by: Creator identifier
            
        Returns:
            Dictionary containing architecture options
        """
        # Get project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Fetch artifacts from Discover stage
        discover_result = await self.db.execute(
            select(Artifact).where(
                Artifact.project_id == project_id,
                Artifact.stage == StageType.DISCOVER
            )
        )
        discover_artifacts = discover_result.scalars().all()
        
        problem_statement = ""
        stakeholder_analysis = ""
        for artifact in discover_artifacts:
            if artifact.artifact_type == ArtifactType.PROBLEM_STATEMENT:
                problem_statement = artifact.content
            elif artifact.artifact_type == ArtifactType.STAKEHOLDER_ANALYSIS:
                stakeholder_analysis = artifact.content
        
        # Fetch artifacts from Define stage
        define_result = await self.db.execute(
            select(Artifact).where(
                Artifact.project_id == project_id,
                Artifact.stage == StageType.DEFINE
            )
        )
        define_artifacts = define_result.scalars().all()
        
        brd_content = ""
        user_stories = ""
        for artifact in define_artifacts:
            if artifact.artifact_type == ArtifactType.BRD:
                brd_content = artifact.content
            elif artifact.artifact_type == ArtifactType.USER_STORIES:
                user_stories = artifact.content
        
        # Build constraints string
        constraints_str = "No specific constraints provided."
        if constraints:
            constraints_parts = []
            if constraints.preferred_tech_stack:
                constraints_parts.append(f"Preferred Tech Stack: {', '.join(constraints.preferred_tech_stack)}")
            if constraints.cloud_provider:
                constraints_parts.append(f"Cloud Provider: {constraints.cloud_provider}")
            if constraints.budget_range:
                constraints_parts.append(f"Budget Range: {constraints.budget_range}")
            if constraints.timeline_weeks:
                constraints_parts.append(f"Timeline: {constraints.timeline_weeks} weeks")
            if constraints.compliance_requirements:
                constraints_parts.append(f"Compliance: {', '.join(constraints.compliance_requirements)}")
            if constraints.scalability_needs:
                constraints_parts.append(f"Scalability: {constraints.scalability_needs}")
            if constraints.team_expertise:
                constraints_parts.append(f"Team Expertise: {', '.join(constraints.team_expertise)}")
            if constraints.existing_systems:
                constraints_parts.append(f"Existing Systems: {', '.join(constraints.existing_systems)}")
            if constraints.additional_notes:
                constraints_parts.append(f"Additional Notes: {constraints.additional_notes}")
            
            if constraints_parts:
                constraints_str = "\n".join(constraints_parts)
        
        # Build additional context from uploaded files
        additional_context = "None provided."
        if uploaded_files:
            file_contents = []
            for f in uploaded_files:
                file_contents.append(f"### {f.get('name', 'Untitled')}:\n{f.get('content', '')}")
            additional_context = "\n\n".join(file_contents)
        
        # Build the prompt
        user_message = DESIGN_USER_PROMPT_TEMPLATE.format(
            problem_statement=problem_statement or "Not available",
            stakeholder_analysis=stakeholder_analysis or "Not available",
            brd_content=brd_content or "Not available",
            user_stories=user_stories or "Not available",
            constraints=constraints_str,
            additional_context=additional_context
        )
        
        print(f"🏗️ Generating architecture options for project: {project.name}")
        
        # Generate with AI
        response_text = await generate_with_openai(
            DESIGN_SYSTEM_PROMPT,
            user_message,
            max_tokens=8000
        )
        
        # Clean and parse JSON response
        cleaned_response = response_text.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.startswith("```"):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        try:
            options_data = json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            print(f"❌ JSON Parse Error: {str(e)}")
            print(f"Raw response: {response_text[:500]}...")
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {str(e)}")
        
        print(f"✅ Generated 3 architecture options")
        
        return {
            "status": "completed",
            "message": "Architecture options generated successfully",
            "data": options_data
        }
    
    async def select_architecture(
        self,
        project_id: str,
        selected_option_id: str,
        options_data: Dict[str, Any],
        created_by: str = "AI Solution Architect"
    ) -> Dict[str, Any]:
        """
        Select an architecture option and create the architecture artifact.
        
        Args:
            project_id: ID of the project
            selected_option_id: ID of the selected option (option_1, option_2, option_3)
            options_data: Full options data from generation
            created_by: Creator identifier
            
        Returns:
            Dictionary containing the architecture artifact
        """
        # Get project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get selected option
        selected_option = options_data.get("options", {}).get(selected_option_id)
        if not selected_option:
            raise HTTPException(status_code=400, detail="Invalid option selected")
        
        # Create comprehensive architecture document
        architecture_content = self._build_architecture_document(
            selected_option,
            options_data
        )
        
        # Create Architecture artifact
        architecture_artifact = Artifact(
            project_id=project_id,
            stage=StageType.DESIGN,
            artifact_type=ArtifactType.ARCHITECTURE,
            name="Solution Architecture Document",
            content=architecture_content,
            version=1,
            created_by=created_by,
            meta_data={
                "selected_option_id": selected_option_id,
                "selected_option_name": selected_option.get('name'),
                "all_options": list(options_data.get("options", {}).keys()),
                "recommendation": options_data.get("recommended_option"),
                "complexity": selected_option.get('complexity'),
                "monthly_cost": selected_option.get('monthly_cost'),
                "mvp_timeline_weeks": selected_option.get('mvp_timeline_weeks')
            }
        )
        self.db.add(architecture_artifact)
        
        # Create commit
        commit = Commit(
            project_id=project_id,
            stage=StageType.DESIGN,
            author_id=created_by,
            message=f"Selected architecture: {selected_option.get('name', 'Architecture')}",
            changes={
                "added": ["Solution Architecture Document"],
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
            "architecture_selected",
            {
                "selected_option": selected_option_id,
                "option_name": selected_option.get('name'),
                "complexity": selected_option.get('complexity')
            }
        )
        
        # Update project stage to DEVELOP
        project.current_stage = StageType.DEVELOP
        
        await self.db.commit()
        await self.db.refresh(architecture_artifact)
        
        print(f"✅ Architecture selected: {selected_option.get('name')}")
        
        return {
            "status": "completed",
            "message": f"Architecture '{selected_option.get('name')}' selected successfully",
            "architecture": {
                "artifact_id": str(architecture_artifact.id),
                "name": architecture_artifact.name,
                "content": architecture_artifact.content,
                "created_at": architecture_artifact.created_at.isoformat(),
                "meta_data": architecture_artifact.meta_data
            },
            "next_stage": "develop"
        }
    
    def _build_architecture_document(
        self,
        selected_option: Dict[str, Any],
        options_data: Dict[str, Any]
    ) -> str:
        """Build the comprehensive architecture document markdown."""
        
        # Build tech stack list
        tech_stack_list = '\n'.join(['- ' + tech for tech in selected_option.get('tech_stack', [])])
        
        # Build components section
        components_list = '\n'.join([
            f"### {comp.get('name', 'Component')}\n**Technology:** {comp.get('technology', 'TBD')}\n\n{comp.get('description', '')}\n"
            for comp in selected_option.get('components', [])
        ])
        
        # Build API endpoints list
        api_endpoints = '\n'.join([
            '- `' + ep + '`'
            for ep in selected_option.get('api_design', {}).get('key_endpoints', [])
        ])
        
        # Build security list
        security_list = '\n'.join([
            '- ' + sec
            for sec in selected_option.get('security_considerations', [])
        ])
        
        # Build risk table
        risk_rows = '\n'.join([
            f"| {r.get('risk', '')} | {r.get('severity', '')} | {r.get('mitigation', '')} |"
            for r in selected_option.get('risk_assessment', [])
        ])
        
        # Build implementation phases
        phases_content = '\n'.join([
            f"### {phase.get('phase', 'Phase')}\n**Duration:** {phase.get('duration_weeks', 'TBD')} weeks\n\n**Deliverables:**\n" + 
            '\n'.join(['- ' + d for d in phase.get('deliverables', [])]) + '\n'
            for phase in selected_option.get('implementation_phases', [])
        ])
        
        # Build strengths list
        strengths_list = '\n'.join([
            '✅ ' + s
            for s in selected_option.get('strengths', [])
        ])
        
        # Build tradeoffs list
        tradeoffs_list = '\n'.join([
            '⚠️ ' + t
            for t in selected_option.get('tradeoffs', [])
        ])
        
        return f"""# Solution Architecture Document

## Selected Architecture: {selected_option.get('name', 'Architecture')}

> {selected_option.get('tagline', '')}

---

## Executive Summary

{options_data.get('analysis_summary', '')}

### Why This Option Was Selected
{options_data.get('recommendation_reasoning', '')}

---

## Architecture Overview

**Complexity:** {selected_option.get('complexity', 'Medium')}
**Estimated Monthly Cost:** {selected_option.get('monthly_cost', 'TBD')}
**MVP Timeline:** {selected_option.get('mvp_timeline_weeks', 'TBD')} weeks
**Scalability:** {selected_option.get('scalability', 'Medium')}
**Compliance Fit:** {selected_option.get('compliance_fit', 'Good')}

### Tech Stack
{tech_stack_list}

---

## Detailed Description

{selected_option.get('detailed_description', '')}

---

## System Architecture Diagram

```mermaid
{selected_option.get('architecture_diagram', 'graph TD\n    A[System] --> B[Component]')}
```

---

## Components

{components_list}

---

## Database Design

**Type:** {selected_option.get('database_design', {}).get('type', 'TBD')}
**Technology:** {selected_option.get('database_design', {}).get('technology', 'TBD')}

### Schema Overview
{selected_option.get('database_design', {}).get('schema_overview', '')}

```mermaid
{selected_option.get('database_design', {}).get('diagram', 'erDiagram\n    ENTITY')}
```

---

## API Design

**Style:** {selected_option.get('api_design', {}).get('style', 'REST')}

### Key Endpoints
{api_endpoints}

---

## Deployment Architecture

```mermaid
{selected_option.get('deployment_diagram', 'graph LR\n    A[Dev] --> B[Prod]')}
```

---

## Security Considerations

{security_list}

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
{risk_rows}

---

## Implementation Phases

{phases_content}

---

## Strengths

{strengths_list}

---

## Trade-offs & Considerations

{tradeoffs_list}

---

## Alternative Options Considered

### Option Comparison Summary

| Aspect | {selected_option.get('name', 'Selected')} | Other Options |
|--------|---------|---------------|
| Complexity | {selected_option.get('complexity', '-')} | Varies |
| Cost | {selected_option.get('monthly_cost', '-')} | Varies |
| Timeline | {selected_option.get('mvp_timeline_weeks', '-')} weeks | Varies |

---

*Document generated by AI Solution Architect*
*Selection Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*
"""
