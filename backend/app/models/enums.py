# app/models/enums.py - Enumeration types
"""
Enum definitions for SDLC Studio domain models.
"""

import enum


class StageType(str, enum.Enum):
    """SDLC stages in the development lifecycle."""
    DISCOVER = "discover"
    DEFINE = "define"
    DESIGN = "design"
    DEVELOP = "develop"
    TEST = "test"
    BUILD = "build"
    DEPLOY = "deploy"


class ArtifactType(str, enum.Enum):
    """Types of artifacts generated during SDLC."""
    # Discover
    PROBLEM_STATEMENT = "problem_statement"
    STAKEHOLDER_ANALYSIS = "stakeholder_analysis"
    # Define
    BRD = "brd"
    PRD = "prd"
    USER_STORIES = "user_stories"
    # Design
    ARCHITECTURE = "architecture"
    SDD = "sdd"
    API_SPEC = "api_spec"
    SOLUTION_OPTIONS = "solution_options"
    # Develop
    CODE = "code"
    # Test
    TEST_PLAN = "test_plan"
    TEST_CASES = "test_cases"
    # Build
    BUILD_CONFIG = "build_config"
    # Deploy
    DEPLOYMENT = "deployment"
    RELEASE_NOTES = "release_notes"


class GateStatus(str, enum.Enum):
    """Status of stage gates."""
    PENDING = "pending"
    READY = "ready"
    PASSED = "passed"
    FAILED = "failed"
    BLOCKED = "blocked"
