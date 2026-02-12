# app/config.py - Configuration management using pydantic-settings
"""
Centralized configuration management for SDLC Studio.
Uses pydantic-settings for type-safe, validated configuration.
"""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_name: str = "SDLC Studio API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./sdlc_studio.db"
    
    # Azure OpenAI
    azure_openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    azure_openai_deployment: str = "gpt-4o-mini"
    azure_openai_api_version: str = "2024-12-01-preview"
    
    # Security
    encryption_key: Optional[str] = None
    
    # CORS
    cors_origins: list[str] = ["*"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]
    
    @property
    def is_openai_configured(self) -> bool:
        """Check if Azure OpenAI is properly configured."""
        return bool(self.azure_openai_api_key and self.azure_openai_endpoint)
    
    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite database."""
        return "sqlite" in self.database_url.lower()


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Convenience access
settings = get_settings()
