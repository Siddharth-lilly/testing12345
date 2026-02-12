# app/api/v1/test.py
"""
Test stage endpoints - Test plan and test case generation.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.stage_test import (
    GenerateTestPlanRequest,
    GenerateTestCasesRequest,
    RunTestsRequest,
    UpdateTestCaseStatusRequest,
)
from app.services.test_service import TestService

router = APIRouter(prefix="/stages/test", tags=["Test Stage"])


@router.post("/generate-plan")
async def generate_test_plan(
    request: GenerateTestPlanRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    TEST STAGE: Generate a comprehensive test plan.
    
    Analyzes all project artifacts (requirements, user stories, architecture,
    development tickets) and creates a detailed test plan document.
    
    The test plan includes:
    - Testing scope and objectives
    - Test strategy (types of testing)
    - Test environment requirements
    - Entry and exit criteria
    - Risk assessment and mitigation
    - Resource requirements
    - Schedule and milestones
    - Deliverables and metrics
    
    Requires:
    - Define stage completed (BRD/User Stories exist)
    
    Args:
        request: Contains project_id and optional created_by
        
    Returns:
        Dictionary containing the generated test plan
    """
    service = TestService(db)
    
    try:
        result = await service.generate_test_plan(
            project_id=request.project_id,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating test plan: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Test plan generation failed: {str(e)}")


@router.get("/{project_id}/plan")
async def get_test_plan(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get existing test plan for a project.
    
    Args:
        project_id: ID of the project
        
    Returns:
        Dictionary containing test plan, or not_found status if not generated
    """
    service = TestService(db)
    return await service.get_test_plan(project_id)


@router.post("/generate-cases")
async def generate_test_cases(
    request: GenerateTestCasesRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    TEST STAGE: Generate detailed test cases.
    
    Analyzes project artifacts and creates specific, actionable test cases
    covering all functional and non-functional requirements.
    
    Test cases include:
    - Clear preconditions and postconditions
    - Step-by-step instructions
    - Expected results
    - Test data requirements
    - Priority and category classification
    
    Test categories:
    - Positive tests (happy path)
    - Negative tests (error handling)
    - Boundary tests (edge cases)
    - Security tests
    - Performance tests
    
    Requires:
    - Define stage completed (User Stories exist)
    
    Args:
        request: Contains project_id and optional created_by
        
    Returns:
        Dictionary containing test suites and cases
    """
    service = TestService(db)
    
    try:
        result = await service.generate_test_cases(
            project_id=request.project_id,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating test cases: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Test case generation failed: {str(e)}")


@router.get("/{project_id}/cases")
async def get_test_cases(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get existing test cases for a project.
    
    Args:
        project_id: ID of the project
        
    Returns:
        Dictionary containing test suites and cases, or empty if not generated
    """
    service = TestService(db)
    return await service.get_test_cases(project_id)


@router.post("/run")
async def run_tests(
    request: RunTestsRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    TEST STAGE: Simulate running test cases.
    
    Executes (simulates) the test cases and generates realistic test results
    including pass/fail status, execution times, and defects found.
    
    This simulation provides:
    - Individual test case results
    - Pass/fail statistics
    - Defect reports for failed tests
    - Recommendations for next steps
    
    Requires:
    - Test cases must be generated first
    
    Args:
        request: Contains project_id, optional test_suite_ids, and created_by
        
    Returns:
        Dictionary containing test execution results and defects found
    """
    service = TestService(db)
    
    try:
        result = await service.run_tests(
            project_id=request.project_id,
            test_suite_ids=request.test_suite_ids,
            created_by=request.created_by
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error running tests: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Test execution failed: {str(e)}")


@router.get("/{project_id}/dashboard")
async def get_test_dashboard(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get test stage dashboard overview.
    
    Provides a summary of all test artifacts and their status:
    - Whether test plan exists
    - Whether test cases exist
    - Whether tests have been run
    - Summary statistics for each
    
    Args:
        project_id: ID of the project
        
    Returns:
        Dictionary with test stage overview
    """
    service = TestService(db)
    return await service.get_test_dashboard(project_id)


@router.put("/{project_id}/cases/{case_id}/status")
async def update_test_case_status(
    project_id: str,
    case_id: str,
    request: UpdateTestCaseStatusRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Manually update a test case's execution status.
    
    Allows QA team to manually record test results for cases
    that were executed manually (not through simulation).
    
    Args:
        project_id: ID of the project
        case_id: Test case ID (e.g., "TC-001")
        request: Contains status, optional notes, and failure details
        
    Returns:
        Dictionary confirming the update
    """
    service = TestService(db)
    return await service.update_test_case_status(
        project_id=project_id,
        case_id=case_id,
        status=request.status,
        notes=request.notes,
        failure_details=request.failure_details
    )