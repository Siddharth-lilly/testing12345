# app/schemas/__init__.py
"""
Pydantic schemas for request/response validation.
"""

from app.schemas.base import BaseSchema, UUIDMixin, TimestampMixin
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.schemas.artifact import (
    ArtifactResponse,
    ArtifactListResponse,
    ArtifactCreate,
    RegenerateRequest,
    GenerationStatus,
)
from app.schemas.stage_discover import (
    DiscoverGenerateRequest,
    DiscoverArtifactResponse,
    DiscoverResponse,
)
from app.schemas.stage_define import (
    DefineGenerateRequest,
    BRDGenerateRequest,
    UserStoriesGenerateRequest,
    DefineArtifactResponse,
    DefineResponse,
)
from app.schemas.stage_design import (
    DesignConstraints,
    UploadedFile,
    DesignGenerateRequest,
    SelectArchitectureRequest,
    DesignGenerateResponse,
    SelectArchitectureResponse,
)
from app.schemas.stage_develop import (
    DevelopTicket,
    GenerateTicketsRequest,
    GenerateTicketsResponse,
    GetTicketsResponse,
    UpdateTicketStatusResponse,
    ImplementTicketRequest,
    ImplementationResult,
)
from app.schemas.stage_test import (
    GenerateTestPlanRequest,
    GenerateTestCasesRequest,
    RunTestsRequest,
    UpdateTestCaseStatusRequest,
    GenerateTestPlanResponse,
    GenerateTestCasesResponse,
    GetTestPlanResponse,
    GetTestCasesResponse,
    RunTestsResponse,
    TestDashboardResponse,
)
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    SendChatResponse,
    ChatHistoryResponse,
    ClearChatResponse,
)
from app.schemas.github import (
    GitHubConfigRequest,
    GitHubConfigResponse,
    GitHubSaveResponse,
    GitHubDeleteResponse,
    GitHubValidationResult,
)

__all__ = [
    # Base
    "BaseSchema",
    "UUIDMixin",
    "TimestampMixin",
    # Project
    "ProjectCreate",
    "ProjectResponse",
    "ProjectUpdate",
    # Artifact
    "ArtifactResponse",
    "ArtifactListResponse",
    "ArtifactCreate",
    "RegenerateRequest",
    "GenerationStatus",
    # Discover
    "DiscoverGenerateRequest",
    "DiscoverArtifactResponse",
    "DiscoverResponse",
    # Define
    "DefineGenerateRequest",
    "BRDGenerateRequest",
    "UserStoriesGenerateRequest",
    "DefineArtifactResponse",
    "DefineResponse",
    # Design
    "DesignConstraints",
    "UploadedFile",
    "DesignGenerateRequest",
    "SelectArchitectureRequest",
    "DesignGenerateResponse",
    "SelectArchitectureResponse",
    # Develop
    "DevelopTicket",
    "GenerateTicketsRequest",
    "GenerateTicketsResponse",
    "GetTicketsResponse",
    "UpdateTicketStatusResponse",
    "ImplementTicketRequest",
    "ImplementationResult",
    # Test
    "GenerateTestPlanRequest",
    "GenerateTestCasesRequest",
    "RunTestsRequest",
    "UpdateTestCaseStatusRequest",
    "GenerateTestPlanResponse",
    "GenerateTestCasesResponse",
    "GetTestPlanResponse",
    "GetTestCasesResponse",
    "RunTestsResponse",
    "TestDashboardResponse",
    # Chat
    "ChatMessageRequest",
    "ChatMessageResponse",
    "SendChatResponse",
    "ChatHistoryResponse",
    "ClearChatResponse",
    # GitHub
    "GitHubConfigRequest",
    "GitHubConfigResponse",
    "GitHubSaveResponse",
    "GitHubDeleteResponse",
    "GitHubValidationResult",
]