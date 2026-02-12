# app/services/test_service.py - Test stage service
"""
Service for the Test stage - Test plan and test case generation.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.models.project import Project
from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.enums import StageType, ArtifactType
from app.services.ai_service import AIService
from app.services.activity_service import log_activity
from app.prompts.test_prompts import (
    TEST_PLAN_SYSTEM_PROMPT,
    TEST_PLAN_USER_PROMPT,
    TEST_CASES_SYSTEM_PROMPT,
    TEST_CASES_USER_PROMPT,
    RUN_TESTS_SYSTEM_PROMPT,
    RUN_TESTS_USER_PROMPT,
)
from app.utils.chat_context import (
    get_all_chat_history,
    format_all_chat_history_for_prompt,
    count_chat_messages
)


class TestService:
    """Service for Test stage operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
    
    async def generate_test_plan(
        self,
        project_id: str,
        created_by: str = "AI"
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive test plan from project artifacts.
        
        Args:
            project_id: ID of the project
            created_by: Creator identifier
            
        Returns:
            Dictionary containing the test plan
        """
        # Get project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        print(f"📋 Generating test plan for project: {project.name}")
        
        # Fetch chat history from all stages
        all_chat_history = await get_all_chat_history(
            self.db,
            project_id,
            stages=[StageType.DISCOVER, StageType.DEFINE, StageType.DESIGN, StageType.DEVELOP, StageType.TEST],
            limit_per_stage=50
        )
        
        chat_context = format_all_chat_history_for_prompt(all_chat_history)
        chat_stats = count_chat_messages(all_chat_history)
        
        print(f"   └── Chat context: {chat_stats['total_messages']} messages")
        
        # Gather all artifacts
        artifacts_result = await self.db.execute(
            select(Artifact).where(Artifact.project_id == project_id)
            .order_by(desc(Artifact.created_at))
        )
        all_artifacts = artifacts_result.scalars().all()
        
        # Organize artifacts
        artifact_contents = {
            "problem_statement": "",
            "brd_content": "",
            "user_stories": "",
            "architecture": "",
            "tickets_summary": ""
        }
        
        captured_types = set()
        tickets_data = None
        
        for artifact in all_artifacts:
            if artifact.artifact_type == ArtifactType.PROBLEM_STATEMENT and ArtifactType.PROBLEM_STATEMENT not in captured_types:
                artifact_contents["problem_statement"] = artifact.content
                captured_types.add(ArtifactType.PROBLEM_STATEMENT)
            elif artifact.artifact_type == ArtifactType.BRD and ArtifactType.BRD not in captured_types:
                artifact_contents["brd_content"] = artifact.content
                captured_types.add(ArtifactType.BRD)
            elif artifact.artifact_type == ArtifactType.USER_STORIES and ArtifactType.USER_STORIES not in captured_types:
                artifact_contents["user_stories"] = artifact.content
                captured_types.add(ArtifactType.USER_STORIES)
            elif artifact.artifact_type == ArtifactType.ARCHITECTURE and ArtifactType.ARCHITECTURE not in captured_types:
                artifact_contents["architecture"] = artifact.content
                captured_types.add(ArtifactType.ARCHITECTURE)
            elif artifact.artifact_type == ArtifactType.CODE and artifact.meta_data and artifact.meta_data.get("type") == "development_tickets":
                if tickets_data is None:
                    try:
                        tickets_data = json.loads(artifact.content)
                        artifact_contents["tickets_summary"] = self._summarize_tickets(tickets_data)
                    except json.JSONDecodeError:
                        pass
        
        # Check minimum requirements
        if not artifact_contents["brd_content"] and not artifact_contents["user_stories"]:
            raise HTTPException(
                status_code=400,
                detail="Missing requirements. Complete Define stage first."
            )
        
        # Build prompt
        artifact_contents["current_date"] = datetime.utcnow().strftime("%Y-%m-%d")
        user_prompt = TEST_PLAN_USER_PROMPT.format(**artifact_contents)
        user_prompt += chat_context
        
        # Call AI
        response_text = await self.ai_service.generate(
            TEST_PLAN_SYSTEM_PROMPT,
            user_prompt,
            max_tokens=4000
        )
        
        # Clean JSON response
        response_text = self._clean_json_response(response_text)
        
        try:
            test_plan_data = json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            print(f"Response was: {response_text[:500]}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
        
        # Create artifact
        test_plan_artifact = Artifact(
            project_id=project_id,
            stage=StageType.TEST,
            artifact_type=ArtifactType.TEST_PLAN,
            name="Test Plan",
            content=json.dumps(test_plan_data, indent=2),
            created_by=created_by,
            meta_data={
                "type": "test_plan",
                "version": "1.0",
                "generated_at": datetime.utcnow().isoformat()
            }
        )
        self.db.add(test_plan_artifact)
        
        # Create commit record
        commit = Commit(
            project_id=project_id,
            stage=StageType.TEST,
            author_id=created_by,
            message="Generated comprehensive test plan",
            changes={
                "added": ["Test Plan"],
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
            "test_plan_generated",
            {
                "summary": test_plan_data.get("summary", {})
            }
        )
        
        await self.db.commit()
        await self.db.refresh(test_plan_artifact)
        
        print(f"✅ Test plan generated successfully")
        
        return {
            "status": "success",
            "message": "Test plan generated successfully",
            "artifact_id": str(test_plan_artifact.id),
            "test_plan": test_plan_data.get("test_plan", {}),
            "summary": test_plan_data.get("summary", {})
        }
    
    async def get_test_plan(self, project_id: str) -> Dict[str, Any]:
        """Get existing test plan for a project."""
        result = await self.db.execute(
            select(Artifact)
            .where(Artifact.project_id == project_id)
            .where(Artifact.artifact_type == ArtifactType.TEST_PLAN)
            .order_by(desc(Artifact.created_at))
        )
        artifact = result.scalar_one_or_none()
        
        if not artifact:
            return {
                "status": "not_found",
                "message": "No test plan found for this project"
            }
        
        try:
            test_plan_data = json.loads(artifact.content)
            return {
                "status": "success",
                "artifact_id": str(artifact.id),
                "test_plan": test_plan_data.get("test_plan", test_plan_data),
                "generated_at": artifact.created_at.isoformat() if artifact.created_at else None
            }
        except json.JSONDecodeError:
            return {
                "status": "error",
                "message": "Failed to parse test plan data"
            }
    
    async def generate_test_cases(
        self,
        project_id: str,
        created_by: str = "AI"
    ) -> Dict[str, Any]:
        """
        Generate detailed test cases from project artifacts.
        
        Args:
            project_id: ID of the project
            created_by: Creator identifier
            
        Returns:
            Dictionary containing test suites and cases
        """
        # Get project
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        print(f"🧪 Generating test cases for project: {project.name}")
        
        # Gather all artifacts
        artifacts_result = await self.db.execute(
            select(Artifact).where(Artifact.project_id == project_id)
            .order_by(desc(Artifact.created_at))
        )
        all_artifacts = artifacts_result.scalars().all()
        
        # Organize artifacts
        artifact_contents = {
            "user_stories": "",
            "brd_content": "",
            "architecture": "",
            "tickets_summary": ""
        }
        
        captured_types = set()
        tickets_data = None
        
        for artifact in all_artifacts:
            if artifact.artifact_type == ArtifactType.USER_STORIES and ArtifactType.USER_STORIES not in captured_types:
                artifact_contents["user_stories"] = artifact.content
                captured_types.add(ArtifactType.USER_STORIES)
            elif artifact.artifact_type == ArtifactType.BRD and ArtifactType.BRD not in captured_types:
                artifact_contents["brd_content"] = artifact.content
                captured_types.add(ArtifactType.BRD)
            elif artifact.artifact_type == ArtifactType.ARCHITECTURE and ArtifactType.ARCHITECTURE not in captured_types:
                artifact_contents["architecture"] = artifact.content
                captured_types.add(ArtifactType.ARCHITECTURE)
            elif artifact.artifact_type == ArtifactType.CODE and artifact.meta_data and artifact.meta_data.get("type") == "development_tickets":
                if tickets_data is None:
                    try:
                        tickets_data = json.loads(artifact.content)
                        artifact_contents["tickets_summary"] = self._summarize_tickets(tickets_data)
                    except json.JSONDecodeError:
                        pass
        
        # Check minimum requirements
        if not artifact_contents["user_stories"] and not artifact_contents["brd_content"]:
            raise HTTPException(
                status_code=400,
                detail="Missing requirements. Complete Define stage first."
            )
        
        # Build prompt
        user_prompt = TEST_CASES_USER_PROMPT.format(**artifact_contents)
        
        # Call AI
        response_text = await self.ai_service.generate(
            TEST_CASES_SYSTEM_PROMPT,
            user_prompt,
            max_tokens=6000
        )
        
        # Clean JSON response
        response_text = self._clean_json_response(response_text)
        
        try:
            test_cases_data = json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            print(f"Response was: {response_text[:500]}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
        
        # Create artifact
        test_cases_artifact = Artifact(
            project_id=project_id,
            stage=StageType.TEST,
            artifact_type=ArtifactType.TEST_CASES,
            name="Test Cases",
            content=json.dumps(test_cases_data, indent=2),
            created_by=created_by,
            meta_data={
                "type": "test_cases",
                "version": "1.0",
                "generated_at": datetime.utcnow().isoformat(),
                "total_suites": len(test_cases_data.get("test_suites", [])),
                "total_cases": test_cases_data.get("summary", {}).get("total_test_cases", 0)
            }
        )
        self.db.add(test_cases_artifact)
        
        # Create commit record
        commit = Commit(
            project_id=project_id,
            stage=StageType.TEST,
            author_id=created_by,
            message=f"Generated {test_cases_data.get('summary', {}).get('total_test_cases', 0)} test cases",
            changes={
                "added": ["Test Cases"],
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
            "test_cases_generated",
            {
                "summary": test_cases_data.get("summary", {})
            }
        )
        
        await self.db.commit()
        await self.db.refresh(test_cases_artifact)
        
        print(f"✅ Test cases generated: {test_cases_data.get('summary', {}).get('total_test_cases', 0)} cases")
        
        return {
            "status": "success",
            "message": "Test cases generated successfully",
            "artifact_id": str(test_cases_artifact.id),
            "test_suites": test_cases_data.get("test_suites", []),
            "summary": test_cases_data.get("summary", {})
        }
    
    async def get_test_cases(self, project_id: str) -> Dict[str, Any]:
        """Get existing test cases for a project."""
        result = await self.db.execute(
            select(Artifact)
            .where(Artifact.project_id == project_id)
            .where(Artifact.artifact_type == ArtifactType.TEST_CASES)
            .order_by(desc(Artifact.created_at))
        )
        artifact = result.scalar_one_or_none()
        
        if not artifact:
            return {
                "status": "not_found",
                "message": "No test cases found for this project",
                "test_suites": [],
                "summary": None
            }
        
        try:
            test_cases_data = json.loads(artifact.content)
            return {
                "status": "success",
                "artifact_id": str(artifact.id),
                "test_suites": test_cases_data.get("test_suites", []),
                "summary": test_cases_data.get("summary", {}),
                "generated_at": artifact.created_at.isoformat() if artifact.created_at else None
            }
        except json.JSONDecodeError:
            return {
                "status": "error",
                "message": "Failed to parse test cases data",
                "test_suites": [],
                "summary": None
            }
    
    async def run_tests(
        self,
        project_id: str,
        test_suite_ids: Optional[List[str]] = None,
        created_by: str = "AI"
    ) -> Dict[str, Any]:
        """
        Simulate running test cases and generate results.
        
        Args:
            project_id: ID of the project
            test_suite_ids: Optional list of specific suites to run
            created_by: Who initiated the test run
            
        Returns:
            Dictionary containing test execution results
        """
        # Get existing test cases
        test_cases_result = await self.get_test_cases(project_id)
        
        if test_cases_result.get("status") != "success":
            raise HTTPException(
                status_code=400,
                detail="No test cases found. Generate test cases first."
            )
        
        test_suites = test_cases_result.get("test_suites", [])
        
        # Filter suites if specific ones requested
        if test_suite_ids:
            test_suites = [s for s in test_suites if s.get("suite_id") in test_suite_ids]
        
        if not test_suites:
            raise HTTPException(
                status_code=400,
                detail="No test suites to execute."
            )
        
        print(f"🏃 Running tests for project: {project_id}")
        print(f"   └── Suites: {len(test_suites)}")
        
        # Get architecture for context
        artifacts_result = await self.db.execute(
            select(Artifact)
            .where(Artifact.project_id == project_id)
            .where(Artifact.artifact_type == ArtifactType.ARCHITECTURE)
            .order_by(desc(Artifact.created_at))
        )
        arch_artifact = artifacts_result.scalar_one_or_none()
        architecture = arch_artifact.content if arch_artifact else ""
        
        # Build prompt
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        start_time = datetime.utcnow().isoformat()
        
        user_prompt = RUN_TESTS_USER_PROMPT.format(
            test_cases=json.dumps(test_suites, indent=2)[:6000],
            architecture=architecture[:2000],
            timestamp=timestamp,
            start_time=start_time,
            end_time=datetime.utcnow().isoformat()
        )
        
        # Call AI
        response_text = await self.ai_service.generate(
            RUN_TESTS_SYSTEM_PROMPT,
            user_prompt,
            max_tokens=6000
        )
        
        # Clean JSON response
        response_text = self._clean_json_response(response_text)
        
        try:
            run_results = json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
        
        # Store test run results
        # Get existing test cases artifact to update
        test_cases_artifact_result = await self.db.execute(
            select(Artifact)
            .where(Artifact.project_id == project_id)
            .where(Artifact.artifact_type == ArtifactType.TEST_CASES)
            .order_by(desc(Artifact.created_at))
        )
        test_cases_artifact = test_cases_artifact_result.scalar_one_or_none()
        
        if test_cases_artifact:
            try:
                existing_data = json.loads(test_cases_artifact.content)
                if "test_runs" not in existing_data:
                    existing_data["test_runs"] = []
                existing_data["test_runs"].append(run_results)
                existing_data["latest_run"] = run_results
                test_cases_artifact.content = json.dumps(existing_data, indent=2)
                flag_modified(test_cases_artifact, "content")
            except json.JSONDecodeError:
                pass
        
        # Create commit record
        commit = Commit(
            project_id=project_id,
            stage=StageType.TEST,
            author_id=created_by,
            message=f"Test run completed: {run_results.get('summary', {}).get('passed', 0)} passed, {run_results.get('summary', {}).get('failed', 0)} failed",
            changes={
                "added": [f"Test Run {run_results.get('test_run', {}).get('run_id', 'unknown')}"],
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
            "tests_executed",
            {
                "run_id": run_results.get("test_run", {}).get("run_id"),
                "summary": run_results.get("summary", {})
            }
        )
        
        await self.db.commit()
        
        print(f"✅ Test execution completed: {run_results.get('summary', {}).get('pass_rate', 0)}% pass rate")
        
        return {
            "status": "success",
            "message": "Test execution completed",
            "test_run": run_results.get("test_run", {}),
            "results": run_results.get("results", []),
            "defects_found": run_results.get("defects_found", []),
            "summary": run_results.get("summary", {}),
            "recommendations": run_results.get("recommendations", [])
        }
    
    async def get_test_dashboard(self, project_id: str) -> Dict[str, Any]:
        """Get overview of test artifacts for a project."""
        test_plan = await self.get_test_plan(project_id)
        test_cases = await self.get_test_cases(project_id)
        
        # Check for test results
        has_results = False
        latest_run_summary = None
        
        if test_cases.get("status") == "success":
            try:
                artifact_result = await self.db.execute(
                    select(Artifact)
                    .where(Artifact.project_id == project_id)
                    .where(Artifact.artifact_type == ArtifactType.TEST_CASES)
                    .order_by(desc(Artifact.created_at))
                )
                artifact = artifact_result.scalar_one_or_none()
                if artifact:
                    data = json.loads(artifact.content)
                    if "latest_run" in data:
                        has_results = True
                        latest_run_summary = data["latest_run"].get("summary", {})
            except:
                pass
        
        return {
            "status": "success",
            "has_test_plan": test_plan.get("status") == "success",
            "has_test_cases": test_cases.get("status") == "success",
            "has_test_results": has_results,
            "test_plan_summary": test_plan.get("test_plan", {}).get("summary") if test_plan.get("status") == "success" else None,
            "test_cases_summary": test_cases.get("summary") if test_cases.get("status") == "success" else None,
            "latest_run_summary": latest_run_summary
        }
    
    async def update_test_case_status(
        self,
        project_id: str,
        case_id: str,
        status: str,
        notes: Optional[str] = None,
        failure_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Manually update a test case's execution status."""
        # Get test cases artifact
        result = await self.db.execute(
            select(Artifact)
            .where(Artifact.project_id == project_id)
            .where(Artifact.artifact_type == ArtifactType.TEST_CASES)
            .order_by(desc(Artifact.created_at))
        )
        artifact = result.scalar_one_or_none()
        
        if not artifact:
            raise HTTPException(status_code=404, detail="Test cases not found")
        
        try:
            test_data = json.loads(artifact.content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid test cases data")
        
        # Find and update the test case
        updated = False
        for suite in test_data.get("test_suites", []):
            for case in suite.get("test_cases", []):
                if case.get("case_id") == case_id:
                    case["manual_status"] = status
                    case["manual_notes"] = notes
                    case["manual_failure_details"] = failure_details
                    case["manually_updated_at"] = datetime.utcnow().isoformat()
                    updated = True
                    break
            if updated:
                break
        
        if not updated:
            raise HTTPException(status_code=404, detail=f"Test case {case_id} not found")
        
        artifact.content = json.dumps(test_data, indent=2)
        flag_modified(artifact, "content")
        
        await self.db.commit()
        
        return {
            "status": "success",
            "case_id": case_id,
            "new_status": status,
            "message": f"Test case {case_id} updated to {status}"
        }
    
    def _clean_json_response(self, response_text: str) -> str:
        """Clean JSON response from AI."""
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        return response_text.strip()
    
    def _summarize_tickets(self, tickets_data: Dict[str, Any]) -> str:
        """Create a summary of development tickets for the test prompts."""
        tickets = tickets_data.get("tickets", [])
        if not tickets:
            return "No development tickets available."
        
        summary_parts = []
        for ticket in tickets[:10]:  # Limit to 10 tickets
            summary_parts.append(
                f"- {ticket.get('key', 'N/A')}: {ticket.get('summary', 'No summary')} "
                f"[{ticket.get('type', 'unknown')}] - {ticket.get('priority', 'unknown')} priority"
            )
        
        return "\n".join(summary_parts)