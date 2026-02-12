# app/models/activity.py - Activity model
"""
Activity model representing user/system activities in a project.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Activity(Base):
    """
    Represents an activity log entry in a project.
    
    Tracks all significant actions like project creation,
    artifact generation, stage transitions, etc.
    
    Attributes:
        id: Unique activity identifier
        project_id: Parent project ID
        user_id: User who performed the activity
        activity_type: Type of activity (e.g., 'project_created', 'discover_completed')
        data: Additional activity data as JSON
        created_at: Activity timestamp
    """
    __tablename__ = "activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(String(255), ForeignKey("projects.id"), nullable=False)
    user_id = Column(String(255), nullable=False)
    activity_type = Column(String(100), nullable=False)
    data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, type='{self.activity_type}')>"
