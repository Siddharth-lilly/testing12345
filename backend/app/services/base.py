# app/services/base.py - Base service class
"""
Base service class with common database operations.
"""

from typing import Any, Generic, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseService(Generic[ModelType]):
    """
    Base service class providing common CRUD operations.
    
    Subclasses should define `model` attribute pointing to the SQLAlchemy model.
    """
    
    model: Type[ModelType]
    
    def __init__(self, db: AsyncSession):
        """Initialize service with database session."""
        self.db = db
    
    async def get_by_id(self, id: UUID) -> Optional[ModelType]:
        """
        Get a record by its UUID.
        
        Args:
            id: UUID of the record
            
        Returns:
            The record if found, None otherwise
        """
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, **kwargs: Any) -> ModelType:
        """
        Create a new record.
        
        Args:
            **kwargs: Field values for the new record
            
        Returns:
            The created record
        """
        instance = self.model(**kwargs)
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance
    
    async def update(self, instance: ModelType, **kwargs: Any) -> ModelType:
        """
        Update an existing record.
        
        Args:
            instance: The record to update
            **kwargs: Field values to update
            
        Returns:
            The updated record
        """
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance
    
    async def delete(self, instance: ModelType) -> None:
        """
        Delete a record.
        
        Args:
            instance: The record to delete
        """
        await self.db.delete(instance)
        await self.db.flush()
    
    async def commit(self) -> None:
        """Commit the current transaction."""
        await self.db.commit()
    
    async def rollback(self) -> None:
        """Rollback the current transaction."""
        await self.db.rollback()
