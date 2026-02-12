# app/api/v1/__init__.py
"""
API v1 router aggregation.
"""

from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.projects import router as projects_router
from app.api.v1.artifacts import router as artifacts_router
from app.api.v1.commits import router as commits_router
from app.api.v1.discover import router as discover_router
from app.api.v1.define import router as define_router
from app.api.v1.design import router as design_router
from app.api.v1.develop import router as develop_router
from app.api.v1.test import router as test_router
from app.api.v1.chat import router as chat_router
from app.api.v1.github import router as github_router

# Create main API router
api_router = APIRouter()

# Include all routers
api_router.include_router(health_router)
api_router.include_router(projects_router)
api_router.include_router(artifacts_router)
api_router.include_router(commits_router)
api_router.include_router(discover_router)
api_router.include_router(define_router)
api_router.include_router(design_router)
api_router.include_router(develop_router)
api_router.include_router(test_router)
api_router.include_router(chat_router)
api_router.include_router(github_router)

__all__ = ["api_router"]