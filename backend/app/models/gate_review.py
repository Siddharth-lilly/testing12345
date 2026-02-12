# app/models/gate_review.py - GateReview model
"""
GateReview model representing stage gate reviews.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.enums import StageType, GateStatus


class GateReview(Base):
    """
    Represents a stage gate review.
    
    Stage gates are approval checkpoints between SDLC stages.
    
    Attributes:
        id: Unique review identifier
        project_id: Parent project ID
        stage: Stage being reviewed
        reviewer_id: Reviewer identifier
        status: Review status (pending, passed, failed, blocked)
        comment: Reviewer comments
        created_at: Review timestamp
    """
    __tablename__ = "gate_reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(String(255), ForeignKey("projects.id"), nullable=False)
    stage = Column(SQLEnum(StageType), nullable=False)
    reviewer_id = Column(String(255), nullable=False)
    status = Column(SQLEnum(GateStatus), default=GateStatus.PENDING)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<GateReview(id={self.id}, stage={self.stage}, status={self.status})>"
