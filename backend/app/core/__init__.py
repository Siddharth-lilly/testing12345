# app/core/__init__.py
"""
Core module containing fundamental infrastructure components.
"""

from app.core.database import Base, engine, AsyncSessionLocal, init_db, close_db, get_db
from app.core.security import encrypt_token, decrypt_token
from app.core.exceptions import (
    SDLCStudioException,
    ProjectNotFoundError,
    ArtifactNotFoundError,
    InvalidUUIDError,
    GitHubNotConfiguredError,
    AIGenerationError,
    MissingArtifactsError,
    not_found,
    bad_request,
    internal_error,
    unauthorized,
    forbidden
)

__all__ = [
    # Database
    "Base",
    "engine",
    "AsyncSessionLocal",
    "init_db",
    "close_db",
    "get_db",
    # Security
    "encrypt_token",
    "decrypt_token",
    # Exceptions
    "SDLCStudioException",
    "ProjectNotFoundError",
    "ArtifactNotFoundError",
    "InvalidUUIDError",
    "GitHubNotConfiguredError",
    "AIGenerationError",
    "MissingArtifactsError",
    "not_found",
    "bad_request",
    "internal_error",
    "unauthorized",
    "forbidden",
]
