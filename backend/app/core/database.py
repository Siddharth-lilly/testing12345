# app/core/database.py - Database engine and session management
"""
Async database configuration using SQLAlchemy 2.0 patterns.
Supports SQLite for development and PostgreSQL for production.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# Create async engine with appropriate settings
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    # SQLite-specific: allow multi-threaded access
    connect_args={"check_same_thread": False} if settings.is_sqlite else {}
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def init_db() -> None:
    """Initialize database by creating all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session.
    Ensures proper cleanup after request completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
