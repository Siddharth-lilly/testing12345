# app/dependencies.py
"""
FastAPI dependency injection functions.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session.
    
    Yields:
        AsyncSession: Database session that auto-closes after request
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
