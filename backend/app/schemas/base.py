# app/schemas/base.py - Base schema classes
"""
Base Pydantic schema classes and validators.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(from_attributes=True)


class UUIDMixin(BaseModel):
    """Mixin for schemas with UUID fields that need string conversion."""
    
    @field_validator('id', 'project_id', 'artifact_id', mode='before', check_fields=False)
    @classmethod
    def convert_uuid_to_str(cls, v: Any) -> str:
        """Convert UUID to string if needed."""
        if isinstance(v, UUID):
            return str(v)
        return v


class TimestampMixin(BaseModel):
    """Mixin for schemas with timestamp fields."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
