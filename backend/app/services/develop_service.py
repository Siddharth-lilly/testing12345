# app/services/develop_service.py - Develop stage service
"""
Service for the Develop stage - Ticket generation and implementation.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.models.project import Project
from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.enums import StageType, ArtifactType
from app.services.ai_service import AIService
from app.services.activity_service import log_activity
from app.services.github_service import GitHubClient, GitHubService
from app.core.security import decrypt_token
from app.prompts import (
    DEVELOP_TICKETS_SYSTEM_PROMPT,
    DEVELOP_TICKETS_USER_PROMPT,
    IMPLEMENT_TICKET_SYSTEM_PROMPT,
    IMPLEMENT_TICKET_USER_PROMPT,
)
from app.utils.chat_context import (
    get_all_chat_history,
    format_all_chat_history_for_prompt,
    count_chat_messages
)


class DevelopService:
    """Service for Develop stage operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
    
    async def generate_tickets(
        self,
        project_id: str,
        created_by: str = "AI"
    ) -> Dict[str, Any]:
        """
        Generate development tickets from all project artifacts AND chat history.
        
        Args:
            project_id: ID of the project
            created_by: Creator identifier
            
        Returns:
            Dictionary containing tickets and summary
        """
        # Get project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check GitHub is configured
        stages_config = project.stages_config or {}
        if not stages_config.get("github"):
            raise HTTPException(
                status_code=400,
                detail="GitHub must be configured before generating tickets"
            )
        
        # Fetch ALL chat history from all stages using shared utility
        all_chat_history = await get_all_chat_history(
            self.db,
            project_id,
            stages=[StageType.DISCOVER, StageType.DEFINE, StageType.DESIGN, StageType.DEVELOP],
            limit_per_stage=75
        )
        
        # Format chat history with strong emphasis
        chat_context = format_all_chat_history_for_prompt(all_chat_history)
        
        # Get stats for logging
        chat_stats = count_chat_messages(all_chat_history)
        total_chat_messages = chat_stats["total_messages"]
        
        print(f"🎫 Generating development tickets for project: {project.name}")
        print(f"   └── Chat context: {total_chat_messages} messages from all SDLC stages")
        for stage, count in chat_stats["by_stage"].items():
            if count > 0:
                print(f"       • {stage}: {count} messages")
        
        # Gather all artifacts from previous stages - get latest version of each type
        artifacts_result = await self.db.execute(
            select(Artifact).where(Artifact.project_id == project_id)
            .order_by(desc(Artifact.created_at))
        )
        all_artifacts = artifacts_result.scalars().all()
        
        # Organize artifacts by type - use only the LATEST of each type
        artifact_contents = {
            "problem_statement": "",
            "stakeholder_analysis": "",
            "brd_content": "",
            "user_stories": "",
            "architecture": ""
        }
        
        # Track which types we've already captured (to get only latest version)
        captured_types = set()
        
        for artifact in all_artifacts:
            if artifact.artifact_type == ArtifactType.PROBLEM_STATEMENT and ArtifactType.PROBLEM_STATEMENT not in captured_types:
                artifact_contents["problem_statement"] = artifact.content
                captured_types.add(ArtifactType.PROBLEM_STATEMENT)
            elif artifact.artifact_type == ArtifactType.STAKEHOLDER_ANALYSIS and ArtifactType.STAKEHOLDER_ANALYSIS not in captured_types:
                artifact_contents["stakeholder_analysis"] = artifact.content
                captured_types.add(ArtifactType.STAKEHOLDER_ANALYSIS)
            elif artifact.artifact_type == ArtifactType.BRD and ArtifactType.BRD not in captured_types:
                artifact_contents["brd_content"] = artifact.content
                captured_types.add(ArtifactType.BRD)
            elif artifact.artifact_type == ArtifactType.USER_STORIES and ArtifactType.USER_STORIES not in captured_types:
                artifact_contents["user_stories"] = artifact.content
                captured_types.add(ArtifactType.USER_STORIES)
            elif artifact.artifact_type == ArtifactType.ARCHITECTURE and ArtifactType.ARCHITECTURE not in captured_types:
                artifact_contents["architecture"] = artifact.content
                captured_types.add(ArtifactType.ARCHITECTURE)
        
        # Check we have minimum required artifacts
        if not artifact_contents["brd_content"] and not artifact_contents["user_stories"]:
            raise HTTPException(
                status_code=400,
                detail="Missing required artifacts. Complete Define stage first."
            )
        
        if not artifact_contents["architecture"]:
            raise HTTPException(
                status_code=400,
                detail="Missing architecture. Complete Design stage first."
            )
        
        # Build prompt with chat history context
        user_prompt = DEVELOP_TICKETS_USER_PROMPT.format(**artifact_contents)
        
        # Append chat history to provide full context
        user_prompt += chat_context
        
        # Call Azure OpenAI
        response_text = await self.ai_service.generate(
            DEVELOP_TICKETS_SYSTEM_PROMPT,
            user_prompt,
            max_tokens=4000
        )
        
        # Clean JSON response
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        try:
            tickets_data = json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            print(f"Response was: {response_text[:500]}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
        
        # Create artifact to store tickets
        tickets_artifact = Artifact(
            project_id=project_id,
            stage=StageType.DEVELOP,
            artifact_type=ArtifactType.CODE,
            name="Development Tickets",
            content=json.dumps(tickets_data, indent=2),
            created_by=created_by,
            meta_data={
                "type": "development_tickets",
                "total_tickets": len(tickets_data.get("tickets", [])),
                "generated_at": datetime.utcnow().isoformat()
            }
        )
        self.db.add(tickets_artifact)
        
        # Create commit record
        commit = Commit(
            project_id=project_id,
            stage=StageType.DEVELOP,
            author_id=created_by,
            message=f"Generated {len(tickets_data.get('tickets', []))} development tickets",
            changes={
                "added": ["Development Tickets"],
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
            "tickets_generated",
            {
                "total_tickets": len(tickets_data.get("tickets", [])),
                "summary": tickets_data.get("summary", {})
            }
        )
        
        await self.db.commit()
        await self.db.refresh(tickets_artifact)
        
        print(f"✅ Generated {len(tickets_data.get('tickets', []))} tickets")
        
        return {
            "status": "success",
            "message": f"Generated {len(tickets_data.get('tickets', []))} development tickets",
            "artifact_id": str(tickets_artifact.id),
            "tickets": tickets_data.get("tickets", []),
            "summary": tickets_data.get("summary", {})
        }
    
    async def get_tickets(self, project_id: str) -> Dict[str, Any]:
        """
        Get existing development tickets for a project.
        
        Args:
            project_id: ID of the project
            
        Returns:
            Dictionary containing tickets and summary
        """
        # Find tickets artifact - get LATEST version with limit(1)
        result = await self.db.execute(
            select(Artifact).where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == StageType.DEVELOP,
                    Artifact.name == "Development Tickets"
                )
            ).order_by(desc(Artifact.created_at)).limit(1)
        )
        artifact = result.scalars().first()
        
        if not artifact:
            return {
                "status": "not_found",
                "tickets": [],
                "summary": {}
            }
        
        try:
            tickets_data = json.loads(artifact.content)
        except json.JSONDecodeError:
            tickets_data = {"tickets": [], "summary": {}}
        
        return {
            "status": "success",
            "artifact_id": str(artifact.id),
            "tickets": tickets_data.get("tickets", []),
            "summary": tickets_data.get("summary", {}),
            "generated_at": artifact.meta_data.get("generated_at") if artifact.meta_data else None
        }
    
    async def update_ticket_status(
        self,
        project_id: str,
        ticket_key: str,
        status: str
    ) -> Dict[str, Any]:
        """
        Update a ticket's status.
        
        Args:
            project_id: ID of the project
            ticket_key: Key of the ticket (e.g., "DEV-101")
            status: New status (todo, in_progress, done)
            
        Returns:
            Dictionary containing updated ticket
        """
        if status not in ["todo", "in_progress", "done"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Must be: todo, in_progress, or done"
            )
        
        # Find tickets artifact - get LATEST version with limit(1)
        result = await self.db.execute(
            select(Artifact).where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == StageType.DEVELOP,
                    Artifact.name == "Development Tickets"
                )
            ).order_by(desc(Artifact.created_at)).limit(1)
        )
        artifact = result.scalars().first()
        
        if not artifact:
            raise HTTPException(
                status_code=404,
                detail="Tickets artifact not found. Generate tickets first."
            )
        
        # Parse and update ticket status
        try:
            tickets_data = json.loads(artifact.content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse tickets data")
        
        # Find and update the specific ticket
        ticket_found = False
        updated_ticket = None
        for ticket in tickets_data.get("tickets", []):
            if ticket["key"] == ticket_key:
                ticket["status"] = status
                ticket_found = True
                updated_ticket = ticket
                break
        
        if not ticket_found:
            raise HTTPException(status_code=404, detail=f"Ticket {ticket_key} not found")
        
        # Save updated content
        artifact.content = json.dumps(tickets_data, indent=2)
        
        # Update meta_data
        meta = artifact.meta_data or {}
        meta["last_updated"] = datetime.utcnow().isoformat()
        meta["last_updated_ticket"] = ticket_key
        artifact.meta_data = meta
        
        flag_modified(artifact, "content")
        flag_modified(artifact, "meta_data")
        
        # Log activity
        await log_activity(
            self.db,
            project_id,
            "user",
            "ticket_status_updated",
            {
                "ticket_key": ticket_key,
                "new_status": status,
                "ticket_summary": updated_ticket.get("summary", "")[:50] if updated_ticket else ""
            }
        )
        
        await self.db.commit()
        
        return {
            "status": "success",
            "ticket_key": ticket_key,
            "new_status": status,
            "ticket": updated_ticket
        }
    
    async def start_implementation(
        self,
        project_id: str,
        ticket_key: str
    ) -> Dict[str, Any]:
        """
        Start implementing a ticket - updates status and returns context.
        
        Args:
            project_id: ID of the project
            ticket_key: Key of the ticket
            
        Returns:
            Dictionary containing ticket and GitHub info
        """
        # Get project
        project_uuid = UUID(project_id)
        project_result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check GitHub is configured
        stages_config = project.stages_config or {}
        github_config = stages_config.get("github")
        
        if not github_config:
            raise HTTPException(
                status_code=400,
                detail="GitHub not configured. Please configure GitHub first."
            )
        
        # Find tickets artifact - get LATEST version with limit(1)
        result = await self.db.execute(
            select(Artifact).where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == StageType.DEVELOP,
                    Artifact.name == "Development Tickets"
                )
            ).order_by(desc(Artifact.created_at)).limit(1)
        )
        artifact = result.scalars().first()
        
        if not artifact:
            raise HTTPException(status_code=404, detail="Tickets not found")
        
        # Parse tickets
        tickets_data = json.loads(artifact.content)
        
        # Find the specific ticket
        target_ticket = None
        for ticket in tickets_data.get("tickets", []):
            if ticket["key"] == ticket_key:
                target_ticket = ticket
                ticket["status"] = "in_progress"
                break
        
        if not target_ticket:
            raise HTTPException(status_code=404, detail=f"Ticket {ticket_key} not found")
        
        # Save updated status
        artifact.content = json.dumps(tickets_data, indent=2)
        flag_modified(artifact, "content")
        
        # Log activity
        await log_activity(
            self.db,
            project_id,
            "user",
            "ticket_implementation_started",
            {
                "ticket_key": ticket_key,
                "ticket_summary": target_ticket.get("summary", ""),
                "ticket_type": target_ticket.get("type", "")
            }
        )
        
        await self.db.commit()
        
        return {
            "status": "success",
            "message": f"Started implementation of {ticket_key}",
            "ticket": target_ticket,
            "github": {
                "repo": github_config.get("repo"),
                "branch": github_config.get("default_branch", "main")
            }
        }
    
    async def implement_ticket(
        self,
        project_id: str,
        ticket_key: str,
        created_by: str = "user"
    ) -> Dict[str, Any]:
        """
        Full ticket implementation workflow:
        1. Create feature branch
        2. Create GitHub Issue
        3. Generate code with AI
        4. Commit files to branch
        5. Create Pull Request
        
        Args:
            project_id: ID of the project
            ticket_key: Key of the ticket
            created_by: Creator identifier
            
        Returns:
            Dictionary containing implementation results
        """
        # Get project with GitHub config
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get GitHub credentials
        stages_config = project.stages_config or {}
        github_config = stages_config.get("github")
        if not github_config:
            raise HTTPException(status_code=400, detail="GitHub not configured")
        
        token = decrypt_token(github_config["encrypted_token"])
        repo = github_config["repo"]
        default_branch = github_config.get("default_branch", "main")
        
        # Get ticket data - LATEST version with limit(1)
        tickets_result = await self.db.execute(
            select(Artifact).where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == StageType.DEVELOP,
                    Artifact.name == "Development Tickets"
                )
            ).order_by(desc(Artifact.created_at)).limit(1)
        )
        tickets_artifact = tickets_result.scalars().first()
        if not tickets_artifact:
            raise HTTPException(status_code=404, detail="Tickets not found")
        
        tickets_data = json.loads(tickets_artifact.content)
        ticket = None
        for t in tickets_data.get("tickets", []):
            if t["key"] == ticket_key:
                ticket = t
                break
        
        if not ticket:
            raise HTTPException(status_code=404, detail=f"Ticket {ticket_key} not found")
        
        # Get architecture for context - LATEST version with limit(1)
        arch_result = await self.db.execute(
            select(Artifact).where(
                and_(
                    Artifact.project_id == project_id,
                    Artifact.stage == StageType.DESIGN,
                    Artifact.artifact_type == ArtifactType.ARCHITECTURE
                )
            ).order_by(desc(Artifact.created_at)).limit(1)
        )
        arch_artifact = arch_result.scalars().first()
        architecture_content = arch_artifact.content if arch_artifact else "No architecture document available"
        
        # Initialize GitHub client
        github = GitHubClient(token, repo)
        
        try:
            # 1. CREATE BRANCH
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
            branch_name = f"feature/{ticket['key'].lower()}-{timestamp}"
            print(f"🌿 Creating branch: {branch_name}")
            
            await github.create_branch(branch_name, default_branch)
            
            # 2. CREATE GITHUB ISSUE
            print(f"📋 Creating GitHub Issue...")
            
            issue_title = f"[{ticket['key']}] {ticket['summary']}"
            issue_body = self._build_issue_body(ticket, branch_name)
            
            labels = ["automated", ticket['type'], f"priority:{ticket['priority'].lower()}"]
            issue = await github.create_issue(issue_title, issue_body, labels)
            issue_number = issue["number"]
            issue_url = issue["html_url"]
            print(f"✅ Created Issue #{issue_number}")
            
            # 3. GENERATE CODE WITH AI
            print(f"🤖 Generating code...")
            
            user_prompt = IMPLEMENT_TICKET_USER_PROMPT.format(
                ticket_key=ticket['key'],
                summary=ticket['summary'],
                type=ticket['type'],
                priority=ticket['priority'],
                description=ticket['description'],
                acceptance_criteria=chr(10).join(f"- {ac}" for ac in ticket['acceptance_criteria']),
                tech_stack=", ".join(ticket['tech_stack']),
                dependencies=", ".join(ticket.get('dependencies', [])) or "None",
                architecture=architecture_content[:3000]
            )
            
            response_text = await self.ai_service.generate(
                IMPLEMENT_TICKET_SYSTEM_PROMPT,
                user_prompt,
                max_tokens=4000
            )
            
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            generated = json.loads(response_text)
            files_to_commit = {f["path"]: f["content"] for f in generated.get("files", [])}
            
            if not files_to_commit:
                raise ValueError("No files generated")
            
            print(f"✅ Generated {len(files_to_commit)} files")
            
            # 4. COMMIT FILES
            print(f"📝 Committing files...")
            
            commit_message = self._build_commit_message(ticket, generated, issue_number, files_to_commit)
            
            commit = await github.create_files_batch(files_to_commit, commit_message, branch_name)
            commit_sha = commit.get("sha", "")[:7]
            print(f"✅ Committed (SHA: {commit_sha})")
            
            # 5. CREATE PULL REQUEST
            print(f"🔀 Creating Pull Request...")
            
            pr_title = f"[{ticket['key']}] {ticket['summary']}"
            pr_body = self._build_pr_body(ticket, generated, issue_number)
            
            pr = await github.create_pull_request(pr_title, pr_body, branch_name, default_branch)
            pr_number = pr["number"]
            pr_url = pr["html_url"]
            print(f"✅ Created PR #{pr_number}")
            
            # 6. ADD COMMENT TO ISSUE
            await github.add_issue_comment(
                issue_number,
                self._build_issue_comment(pr_number, pr_url, branch_name, commit_sha, files_to_commit)
            )
            
            # 7. UPDATE TICKET STATUS
            ticket["status"] = "in_progress"
            ticket["implementation"] = {
                "branch": branch_name,
                "issue_number": issue_number,
                "issue_url": issue_url,
                "pr_number": pr_number,
                "pr_url": pr_url,
                "commit_sha": commit_sha,
                "files": list(files_to_commit.keys()),
                "implemented_at": datetime.utcnow().isoformat()
            }
            
            tickets_artifact.content = json.dumps(tickets_data, indent=2)
            flag_modified(tickets_artifact, "content")
            
            # Log activity
            await log_activity(
                self.db, project_id, created_by,
                "ticket_implemented",
                {
                    "ticket_key": ticket["key"],
                    "branch": branch_name,
                    "issue_number": issue_number,
                    "pr_number": pr_number,
                    "files_created": list(files_to_commit.keys())
                }
            )
            
            await self.db.commit()
            
            print(f"🎉 Implementation complete for {ticket['key']}")
            
            return {
                "status": "success",
                "ticket_key": ticket["key"],
                "branch_name": branch_name,
                "issue_number": issue_number,
                "issue_url": issue_url,
                "pr_number": pr_number,
                "pr_url": pr_url,
                "files_created": list(files_to_commit.keys()),
                "commit_sha": commit_sha,
                "summary": generated.get("summary", "")
            }
            
        except Exception as e:
            error_msg = f"Implementation failed: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=error_msg)
    
    def _build_issue_body(self, ticket: dict, branch_name: str) -> str:
        """Build GitHub issue body."""
        return f"""## {ticket['key']}: {ticket['summary']}

### Description
{ticket['description']}

### Acceptance Criteria
{chr(10).join(f'- [ ] {ac}' for ac in ticket['acceptance_criteria'])}

### Technical Details
| Field | Value |
|-------|-------|
| **Type** | {ticket['type']} |
| **Priority** | {ticket['priority']} |
| **Estimated Hours** | {ticket['estimated_hours']} |
| **Tech Stack** | {', '.join(ticket['tech_stack'])} |

### Branch
`{branch_name}`

---
*Auto-generated by SDLC Studio*
"""
    
    def _build_commit_message(
        self,
        ticket: dict,
        generated: dict,
        issue_number: int,
        files: dict
    ) -> str:
        """Build commit message."""
        return f"""feat({ticket['key']}): {ticket['summary']}

{generated.get('summary', 'Implementation')}

Closes #{issue_number}

Files:
{chr(10).join(f'- {f}' for f in files.keys())}
"""
    
    def _build_pr_body(self, ticket: dict, generated: dict, issue_number: int) -> str:
        """Build pull request body."""
        return f"""## Summary
{generated.get('summary', ticket['summary'])}

Closes #{issue_number}

## Changes
{chr(10).join(f'- `{f["path"]}`: {f.get("description", "Implementation")}' for f in generated.get("files", []))}

## Ticket Details
- **Type:** {ticket['type']}
- **Priority:** {ticket['priority']}
- **Estimated Hours:** {ticket['estimated_hours']}

## Acceptance Criteria
{chr(10).join(f'- [ ] {ac}' for ac in ticket['acceptance_criteria'])}

## Implementation Notes
{chr(10).join(f'- {n}' for n in generated.get("notes", ["No additional notes"]))}

---
*Auto-generated by SDLC Studio*
"""
    
    def _build_issue_comment(
        self,
        pr_number: int,
        pr_url: str,
        branch_name: str,
        commit_sha: str,
        files: dict
    ) -> str:
        """Build issue comment after PR creation."""
        return f"""🔗 **Pull Request Created**

PR #{pr_number}: {pr_url}
Branch: `{branch_name}`
Commit: `{commit_sha}`

### Generated Files
{chr(10).join(f'- `{f}`' for f in files.keys())}
"""