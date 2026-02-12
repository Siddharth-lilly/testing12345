# app/api/v1/health.py
"""
Health check endpoints.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Status and message
    """
    return {
        "status": "healthy",
        "message": "SDLC Studio API is running"
    }
