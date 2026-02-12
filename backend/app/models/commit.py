# app/models/commit.py - Commit model
"""
Commit model representing changes/commits within a project.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, DateTime, JSON, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.enums import StageType


class Commit(Base):
    """
    Represents a commit/change record in a project.
    
    Tracks what was added, modified, or deleted during generation
    or manual updates.
    
    Attributes:
        id: Unique commit identifier
        project_id: Parent project ID
        stage: Stage where the commit was made
        author_id: User/system who made the commit
        message: Commit message
        changes: JSON containing added/modified/deleted items
        created_at: Commit timestamp
    """
    __tablename__ = "commits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(String(255), ForeignKey("projects.id"), nullable=False)
    stage = Column(SQLEnum(StageType), nullable=False)
    author_id = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    changes = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<Commit(id={self.id}, stage={self.stage}, message='{self.message[:30]}...')>"
