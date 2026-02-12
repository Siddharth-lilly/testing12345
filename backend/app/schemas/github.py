# app/schemas/github.py - GitHub schemas
"""
Pydantic schemas for GitHub configuration and operations.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, model_validator


class GitHubConfigRequest(BaseModel):
    """Request schema for saving GitHub configuration."""
    token: Optional[str] = Field(default=None, description="GitHub Personal Access Token")
    github_token: Optional[str] = Field(default=None, description="GitHub Personal Access Token (alias)")
    repo: Optional[str] = Field(default=None, description="Repository in 'owner/repo' format")
    github_repo: Optional[str] = Field(default=None, description="Repository in 'owner/repo' format (alias)")
    default_branch: Optional[str] = Field(default="main", description="Default branch name")
    
    # These will be populated by the validator
    effective_token: Optional[str] = Field(default=None, exclude=True)
    effective_repo: Optional[str] = Field(default=None, exclude=True)
    
    @model_validator(mode='after')
    def set_effective_values(self):
        """Set effective token and repo from either field name."""
        self.effective_token = self.token or self.github_token or ""
        self.effective_repo = self.repo or self.github_repo or ""
        return self
    
    model_config = {
        "extra": "allow"  # Allow extra fields from frontend
    }


class GitHubConfigResponse(BaseModel):
    """Response schema for GitHub configuration status."""
    is_configured: bool
    github_repo: Optional[str] = None
    repo_name: Optional[str] = None
    default_branch: Optional[str] = None


class GitHubSaveResponse(BaseModel):
    """Response schema for saving GitHub config."""
    status: str
    message: str
    data: Dict[str, Any]


class GitHubDeleteResponse(BaseModel):
    """Response schema for deleting GitHub config."""
    status: str
    message: str


class GitHubValidationResult(BaseModel):
    """Result of GitHub validation."""
    repo_name: str
    default_branch: str
    private: bool
    permissions: Dict[str, bool]