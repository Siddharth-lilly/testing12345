# app/api/v1/github.py
"""
GitHub configuration endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.github import GitHubConfigRequest
from app.services.github_service import GitHubService

router = APIRouter(prefix="/github", tags=["GitHub"])


@router.post("/validate")
async def validate_github_credentials(
    request: GitHubConfigRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Validate GitHub credentials without saving them.
    
    Tests:
    1. Token is valid and not expired
    2. Token has access to the specified repository
    3. Required permissions are present (repo, issues, pull requests)
    
    Args:
        request: Contains token, repo (owner/name), and optional default_branch
        
    Returns:
        Dictionary with validation results including repo info and permissions
    """
    service = GitHubService(db)
    
    # Get effective values
    token = request.effective_token
    repo = request.effective_repo
    
    if not token:
        raise HTTPException(status_code=400, detail="GitHub token is required")
    if not repo:
        raise HTTPException(status_code=400, detail="GitHub repo is required")
    
    return await service.validate_config(token=token, repo=repo)


@router.post("/projects/{project_id}/config")
async def save_github_config(
    project_id: str,
    request: GitHubConfigRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Save GitHub configuration for a project.
    
    Validates credentials first, then encrypts and stores the token.
    The configuration is stored in the project's stages_config.
    
    Args:
        project_id: ID of the project
        request: Contains token, repo, and optional default_branch
        
    Returns:
        Dictionary confirming save with repo info (token is masked)
    """
    service = GitHubService(db)
    
    # Get effective values
    token = request.effective_token
    repo = request.effective_repo
    
    if not token:
        raise HTTPException(status_code=400, detail="GitHub token is required")
    if not repo:
        raise HTTPException(status_code=400, detail="GitHub repo is required")
    
    try:
        result = await service.save_config(
            project_id=project_id,
            github_token=token,
            github_repo=repo
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error saving GitHub config: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save config: {str(e)}")


@router.get("/projects/{project_id}/config")
async def get_github_config(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get GitHub configuration for a project.
    
    Returns the stored configuration with the token masked for security.
    
    Args:
        project_id: ID of the project
        
    Returns:
        Dictionary containing repo, default_branch, and masked token
    """
    service = GitHubService(db)
    return await service.get_config(project_id)


@router.delete("/projects/{project_id}/config")
async def delete_github_config(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete GitHub configuration for a project.
    
    Removes the encrypted token and config from the project.
    
    Args:
        project_id: ID of the project
        
    Returns:
        Dictionary confirming deletion
    """
    service = GitHubService(db)
    return await service.delete_config(project_id)