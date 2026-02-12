# app/models/__init__.py
"""
SQLAlchemy models for SDLC Studio.

All models inherit from the shared Base class and use UUID primary keys.
"""

from app.core.database import Base
from app.models.enums import StageType, ArtifactType, GateStatus
from app.models.project import Project
from app.models.artifact import Artifact
from app.models.commit import Commit
from app.models.activity import Activity
from app.models.gate_review import GateReview
from app.models.chat_message import ChatMessage

__all__ = [
    # Base
    "Base",
    # Enums
    "StageType",
    "ArtifactType",
    "GateStatus",
    # Models
    "Project",
    "Artifact",
    "Commit",
    "Activity",
    "GateReview",
    "ChatMessage",
]
