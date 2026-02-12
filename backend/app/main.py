# app/main.py
"""
SDLC Studio API - FastAPI Application Factory

This is the main entry point for the SDLC Studio backend.
Refactored from monolithic main.py into modular microservices architecture.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.database import init_db, close_db
from app.api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events:
    - Startup: Initialize database, create tables
    - Shutdown: Close database connections
    """
    # Startup
    print("🚀 Starting SDLC Studio API...")
    await init_db()
    print("✅ Database initialized")
    print(f"📡 API ready at http://localhost:8000/api")
    
    yield
    
    # Shutdown
    print("👋 Shutting down SDLC Studio API...")
    await close_db()
    print("✅ Database connections closed")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured application instance
    """
    app = FastAPI(
        title=settings.app_name,
         description="AI-Powered Software Development Lifecycle Studio",
         version="2.0.0",
         docs_url="/api/docs",
         redoc_url="/api/redoc",
         openapi_url="/api/openapi.json",
         lifespan=lifespan,
     )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routes
    app.include_router(api_router, prefix="/api")
    
    return app


# Create the application instance
app = create_app()


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": settings.app_name,
        "version": "2.0.0",
        "description": "AI-Powered Software Development Lifecycle Studio",
        "docs": "/api/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
