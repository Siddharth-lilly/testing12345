# app/schemas/stage_test.py - Test stage schemas
"""
Pydantic schemas for the Test stage (test plan and test cases).
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


# ==================== TEST PLAN ====================

class TestingType(BaseModel):
    """A single testing type in the strategy."""
    type: str  # e.g., "Unit Testing", "Integration Testing"
    description: str
    coverage_target: str
    tools: List[str]
    responsibility: str


class TestEnvironment(BaseModel):
    """Test environment configuration."""
    name: str  # e.g., "Development", "QA", "UAT"
    purpose: str
    infrastructure: str


class RiskItem(BaseModel):
    """A risk assessment item."""
    risk: str
    probability: str  # High/Medium/Low
    impact: str  # High/Medium/Low
    mitigation: str


class SchedulePhase(BaseModel):
    """A phase in the test schedule."""
    phase: str
    duration: str
    deliverables: List[str]


class TestMetric(BaseModel):
    """A test metric to track."""
    metric: str
    target: str
    measurement: str


# ==================== TEST CASES ====================

class TestStep(BaseModel):
    """A single step in a test case."""
    step: int
    action: str
    expected_result: str


class TestCase(BaseModel):
    """A single test case."""
    case_id: str  # e.g., "TC-001"
    title: str
    description: str
    type: str  # "Functional", "Security", "Performance"
    priority: str  # "Critical", "High", "Medium", "Low"
    category: str  # "Positive", "Negative", "Boundary"
    preconditions: List[str]
    test_data: Optional[Dict[str, Any]] = {}
    steps: List[TestStep]
    expected_result: str
    postconditions: List[str] = []
    tags: List[str] = []


class TestSuite(BaseModel):
    """A suite of related test cases."""
    suite_id: str  # e.g., "TS-001"
    name: str
    description: str
    priority: str
    related_tickets: List[str] = []
    test_cases: List[TestCase]


# ==================== TEST EXECUTION ====================

class FailureDetails(BaseModel):
    """Details of a test failure."""
    step_failed: int
    expected: str
    actual: str
    screenshot: Optional[str] = None
    logs: Optional[str] = None


class TestResult(BaseModel):
    """Result of a single test case execution."""
    case_id: str
    title: str
    status: str  # "passed", "failed", "blocked", "skipped"
    execution_time_ms: int
    executed_at: str
    notes: Optional[str] = None
    failure_details: Optional[FailureDetails] = None
    blocked_reason: Optional[str] = None
    skip_reason: Optional[str] = None
    defect_id: Optional[str] = None


class Defect(BaseModel):
    """A defect found during testing."""
    defect_id: str
    title: str
    severity: str  # "Critical", "High", "Medium", "Low"
    priority: str
    test_case: str
    description: str
    steps_to_reproduce: List[str]
    expected_result: str
    actual_result: str
    environment: str
    status: str  # "Open", "In Progress", "Resolved", "Closed"
    assigned_to: Optional[str] = None


# ==================== REQUEST SCHEMAS ====================

class GenerateTestPlanRequest(BaseModel):
    """Request schema for generating a test plan."""
    project_id: str
    created_by: Optional[str] = "user"


class GenerateTestCasesRequest(BaseModel):
    """Request schema for generating test cases."""
    project_id: str
    created_by: Optional[str] = "user"


class RunTestsRequest(BaseModel):
    """Request schema for running/simulating tests."""
    project_id: str
    test_suite_ids: Optional[List[str]] = None  # Run specific suites, or all if None
    created_by: Optional[str] = "user"


class UpdateTestCaseStatusRequest(BaseModel):
    """Request schema for manually updating a test case status."""
    status: str  # "passed", "failed", "blocked", "skipped", "not_run"
    notes: Optional[str] = None
    failure_details: Optional[Dict[str, Any]] = None


# ==================== RESPONSE SCHEMAS ====================

class GenerateTestPlanResponse(BaseModel):
    """Response schema for test plan generation."""
    status: str
    message: str
    artifact_id: str
    test_plan: Dict[str, Any]
    summary: Dict[str, Any]


class GenerateTestCasesResponse(BaseModel):
    """Response schema for test cases generation."""
    status: str
    message: str
    artifact_id: str
    test_suites: List[Dict[str, Any]]
    summary: Dict[str, Any]


class GetTestPlanResponse(BaseModel):
    """Response schema for getting test plan."""
    status: str
    artifact_id: Optional[str] = None
    test_plan: Optional[Dict[str, Any]] = None
    generated_at: Optional[str] = None


class GetTestCasesResponse(BaseModel):
    """Response schema for getting test cases."""
    status: str
    artifact_id: Optional[str] = None
    test_suites: List[Dict[str, Any]] = []
    summary: Optional[Dict[str, Any]] = None
    generated_at: Optional[str] = None


class RunTestsResponse(BaseModel):
    """Response schema for test execution."""
    status: str
    message: str
    test_run: Dict[str, Any]
    results: List[Dict[str, Any]]
    defects_found: List[Dict[str, Any]]
    summary: Dict[str, Any]
    recommendations: List[str]


class TestDashboardResponse(BaseModel):
    """Response schema for test dashboard overview."""
    status: str
    has_test_plan: bool
    has_test_cases: bool
    has_test_results: bool
    test_plan_summary: Optional[Dict[str, Any]] = None
    test_cases_summary: Optional[Dict[str, Any]] = None
    latest_run_summary: Optional[Dict[str, Any]] = None