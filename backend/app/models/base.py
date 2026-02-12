# app/models/base.py - Base model classes and mixins
"""
Base classes and mixins for SQLAlchemy models.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class TimestampMixin:
    """Mixin that adds created_at and updated_at timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class UUIDMixin:
    """Mixin that adds UUID primary key."""
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)


# Re-export Base for convenience
__all__ = ["Base", "TimestampMixin", "UUIDMixin"]
