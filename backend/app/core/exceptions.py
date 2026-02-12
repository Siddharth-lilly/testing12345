# app/core/exceptions.py - Custom exceptions
"""
Custom exception classes for SDLC Studio.
Provides clear, domain-specific error handling.
"""

from typing import Any, Optional
from fastapi import HTTPException, status


class SDLCStudioException(Exception):
    """Base exception for SDLC Studio."""
    
    def __init__(self, message: str, details: Optional[dict] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ProjectNotFoundError(SDLCStudioException):
    """Raised when a project is not found."""
    pass


class ArtifactNotFoundError(SDLCStudioException):
    """Raised when an artifact is not found."""
    pass


class InvalidUUIDError(SDLCStudioException):
    """Raised when an invalid UUID format is provided."""
    pass


class GitHubNotConfiguredError(SDLCStudioException):
    """Raised when GitHub is not configured for a project."""
    pass


class AIGenerationError(SDLCStudioException):
    """Raised when AI generation fails."""
    pass


class MissingArtifactsError(SDLCStudioException):
    """Raised when required artifacts are missing."""
    pass


# HTTP Exception helpers
def not_found(detail: str = "Resource not found") -> HTTPException:
    """Create a 404 Not Found exception."""
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def bad_request(detail: str = "Invalid request") -> HTTPException:
    """Create a 400 Bad Request exception."""
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def internal_error(detail: str = "Internal server error") -> HTTPException:
    """Create a 500 Internal Server Error exception."""
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


def unauthorized(detail: str = "Unauthorized") -> HTTPException:
    """Create a 401 Unauthorized exception."""
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def forbidden(detail: str = "Forbidden") -> HTTPException:
    """Create a 403 Forbidden exception."""
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
