# app/models/artifact.py - Artifact model
"""
Artifact model representing generated documents and code.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, Integer, DateTime, JSON, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.enums import StageType, ArtifactType


class Artifact(Base):
    """
    Represents an artifact generated during the SDLC process.
    
    Artifacts include documents (BRD, User Stories), architecture diagrams,
    generated code, and other deliverables.
    
    Attributes:
        id: Unique artifact identifier
        project_id: Parent project ID
        stage: SDLC stage this artifact belongs to
        artifact_type: Type of artifact
        name: Display name
        content: Artifact content (usually markdown or JSON)
        version: Version number for regenerated artifacts
        created_by: Creator identifier
        created_at: Creation timestamp
        updated_at: Last update timestamp
        meta_data: Additional metadata (model used, tokens, etc.)
    """
    __tablename__ = "artifacts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(String(255), ForeignKey("projects.id"), nullable=False)
    stage = Column(SQLEnum(StageType), nullable=False)
    artifact_type = Column(SQLEnum(ArtifactType), nullable=False)
    name = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    meta_data = Column(JSON, default=dict)
    
    def __repr__(self) -> str:
        return f"<Artifact(id={self.id}, type={self.artifact_type}, name='{self.name}')>"
