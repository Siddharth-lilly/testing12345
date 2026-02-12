# app/services/github_service.py - GitHub integration service
"""
Service for GitHub integration including validation, configuration, and API operations.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

import httpx
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.models.project import Project
from app.core.security import encrypt_token, decrypt_token
from app.services.activity_service import log_activity


class GitHubClient:
    """GitHub API client for ticket implementation."""
    
    def __init__(self, token: str, repo: str):
        """
        Initialize GitHub client.
        
        Args:
            token: GitHub personal access token
            repo: Repository in 'owner/repo' format
        """
        self.token = token
        if "/" in repo:
            self.owner, self.repo = repo.split("/", 1)
        else:
            raise ValueError("Repo must be in 'owner/repo' format")
        
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    
    async def _request(self, method: str, endpoint: str, **kwargs) -> dict:
        """Make a request to GitHub API."""
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}{endpoint}"
            response = await client.request(method, url, headers=self.headers, **kwargs)
            response.raise_for_status()
            return response.json() if response.content else {}
    
    async def get_default_branch(self) -> str:
        """Get the default branch of the repository."""
        repo = await self._request("GET", f"/repos/{self.owner}/{self.repo}")
        return repo["default_branch"]
    
    async def get_branch_sha(self, branch: str) -> str:
        """Get the SHA of a branch."""
        branch_data = await self._request("GET", f"/repos/{self.owner}/{self.repo}/branches/{branch}")
        return branch_data["commit"]["sha"]
    
    async def create_branch(self, name: str, from_branch: str = None) -> dict:
        """Create a new branch."""
        if not from_branch:
            from_branch = await self.get_default_branch()
        sha = await self.get_branch_sha(from_branch)
        return await self._request(
            "POST", f"/repos/{self.owner}/{self.repo}/git/refs",
            json={"ref": f"refs/heads/{name}", "sha": sha}
        )
    
    async def create_issue(self, title: str, body: str, labels: list = None) -> dict:
        """Create a GitHub issue."""
        data = {"title": title, "body": body}
        if labels:
            data["labels"] = labels
        return await self._request("POST", f"/repos/{self.owner}/{self.repo}/issues", json=data)
    
    async def add_issue_comment(self, issue_number: int, body: str) -> dict:
        """Add a comment to an issue."""
        return await self._request(
            "POST", f"/repos/{self.owner}/{self.repo}/issues/{issue_number}/comments",
            json={"body": body}
        )
    
    async def create_files_batch(self, files: dict, message: str, branch: str) -> dict:
        """Create multiple files in a single commit."""
        branch_sha = await self.get_branch_sha(branch)
        
        # Get base tree
        commit = await self._request("GET", f"/repos/{self.owner}/{self.repo}/git/commits/{branch_sha}")
        base_tree = commit["tree"]["sha"]
        
        # Create blobs for each file
        tree_items = []
        for path, content in files.items():
            blob = await self._request(
                "POST", f"/repos/{self.owner}/{self.repo}/git/blobs",
                json={"content": content, "encoding": "utf-8"}
            )
            tree_items.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
        
        # Create tree
        new_tree = await self._request(
            "POST", f"/repos/{self.owner}/{self.repo}/git/trees",
            json={"base_tree": base_tree, "tree": tree_items}
        )
        
        # Create commit
        new_commit = await self._request(
            "POST", f"/repos/{self.owner}/{self.repo}/git/commits",
            json={"message": message, "tree": new_tree["sha"], "parents": [branch_sha]}
        )
        
        # Update branch ref
        await self._request(
            "PATCH", f"/repos/{self.owner}/{self.repo}/git/refs/heads/{branch}",
            json={"sha": new_commit["sha"]}
        )
        
        return new_commit
    
    async def create_pull_request(self, title: str, body: str, head: str, base: str = None) -> dict:
        """Create a pull request."""
        if not base:
            base = await self.get_default_branch()
        return await self._request(
            "POST", f"/repos/{self.owner}/{self.repo}/pulls",
            json={"title": title, "body": body, "head": head, "base": base}
        )


class GitHubService:
    """Service for GitHub configuration and operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def validate_config(self, token: str, repo: str) -> Dict[str, Any]:
        """
        Validate GitHub token and repository.
        
        Args:
            token: GitHub personal access token
            repo: Repository in 'owner/repo' format
            
        Returns:
            Repository information
        """
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{repo}",
                headers=headers
            )
            
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Invalid GitHub token")
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"Repository '{repo}' not found or not accessible")
            elif response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="GitHub API error")
            
            repo_data = response.json()
            
            return {
                "repo_name": repo_data["full_name"],
                "default_branch": repo_data["default_branch"],
                "private": repo_data["private"],
                "permissions": repo_data.get("permissions", {})
            }
    
    async def save_config(
        self,
        project_id: str,
        github_token: str,
        github_repo: str
    ) -> Dict[str, Any]:
        """
        Save GitHub configuration for a project.
        
        Args:
            project_id: ID of the project
            github_token: GitHub personal access token
            github_repo: Repository in 'owner/repo' format
            
        Returns:
            Success response with repo info
        """
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Validate repo format
        if "/" not in github_repo or len(github_repo.split("/")) != 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid repo format. Use 'owner/repo' (e.g., 'myorg/myrepo')"
            )
        
        # Validate GitHub credentials
        print(f"🔐 Validating GitHub config for project {project_id}")
        repo_info = await self.validate_config(github_token, github_repo)
        print(f"✅ GitHub validation successful: {repo_info['repo_name']}")
        
        # Check for required permissions
        permissions = repo_info.get("permissions", {})
        if not permissions.get("push", False):
            raise HTTPException(
                status_code=403,
                detail="Token does not have push access to this repository"
            )
        
        # Encrypt token and store
        encrypted_token = encrypt_token(github_token)
        
        # Update project's stages_config
        stages_config = project.stages_config or {}
        stages_config["github"] = {
            "repo": github_repo,
            "encrypted_token": encrypted_token,
            "default_branch": repo_info["default_branch"],
            "configured_at": datetime.utcnow().isoformat()
        }
        
        project.stages_config = stages_config
        flag_modified(project, "stages_config")
        
        await self.db.commit()
        
        await log_activity(
            self.db,
            project_id,
            "system",
            "github_configured",
            {"repo": github_repo}
        )
        
        return {
            "status": "success",
            "message": "GitHub configuration saved successfully",
            "data": {
                "repo": repo_info["repo_name"],
                "default_branch": repo_info["default_branch"]
            }
        }
    
    async def get_config(self, project_id: str) -> Dict[str, Any]:
        """
        Get GitHub configuration status for a project.
        
        Args:
            project_id: ID of the project
            
        Returns:
            GitHub configuration status (without token)
        """
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        stages_config = project.stages_config or {}
        github_config = stages_config.get("github")
        
        if not github_config:
            return {"is_configured": False}
        
        return {
            "is_configured": True,
            "github_repo": github_config.get("repo"),
            "default_branch": github_config.get("default_branch")
        }
    
    async def delete_config(self, project_id: str) -> Dict[str, Any]:
        """
        Delete GitHub configuration from a project.
        
        Args:
            project_id: ID of the project
            
        Returns:
            Success response
        """
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        stages_config = project.stages_config or {}
        if "github" in stages_config:
            del stages_config["github"]
            project.stages_config = stages_config
            flag_modified(project, "stages_config")
            await self.db.commit()
        
        return {"status": "success", "message": "GitHub configuration removed"}
    
    async def get_credentials(self, project_id: str) -> Tuple[str, str, str]:
        """
        Get decrypted GitHub credentials for a project.
        
        Args:
            project_id: ID of the project
            
        Returns:
            Tuple of (token, repo, default_branch)
        """
        project_uuid = UUID(project_id)
        result = await self.db.execute(
            select(Project).where(Project.id == project_uuid)
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        stages_config = project.stages_config or {}
        github_config = stages_config.get("github")
        
        if not github_config:
            raise HTTPException(
                status_code=400,
                detail="GitHub not configured for this project. Please configure GitHub first."
            )
        
        token = decrypt_token(github_config["encrypted_token"])
        repo = github_config["repo"]
        default_branch = github_config.get("default_branch", "main")
        
        return token, repo, default_branch
