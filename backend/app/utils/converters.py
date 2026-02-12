# app/utils/converters.py
"""
Model to dictionary converters for API responses.
Preserves exact format from original main.py.
"""

from typing import Any, Dict, Optional
from app.models import Project, Artifact


def project_to_dict(project: Project) -> Dict[str, Any]:
    """
    Convert Project model to dictionary for API response.
    
    Args:
        project: Project model instance
        
    Returns:
        Dictionary representation matching original API contract
    """
    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "current_stage": project.current_stage.value if project.current_stage else None,
        "stages_config": project.stages_config or {},
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
    }


def artifact_to_dict(artifact: Artifact) -> Dict[str, Any]:
    """
    Convert Artifact model to dictionary for API response.
    
    Args:
        artifact: Artifact model instance
        
    Returns:
        Dictionary representation matching original API contract
    """
    artifact_id_str = str(artifact.id)
    return {
        "id": artifact_id_str,
        "artifact_id": artifact_id_str,  # Alias for frontend compatibility
        "project_id": str(artifact.project_id) if artifact.project_id else None,
        "stage": artifact.stage.value if artifact.stage else None,
        "artifact_type": artifact.artifact_type.value if artifact.artifact_type else None,
        "name": artifact.name,
        "content": artifact.content,
        "version": artifact.version,
        "created_by": artifact.created_by,
        "meta_data": artifact.meta_data or {},
        "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
        "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
    }


def commit_to_dict(commit) -> Dict[str, Any]:
    """
    Convert Commit model to dictionary for API response.
    
    Args:
        commit: Commit model instance
        
    Returns:
        Dictionary representation
    """
    return {
        "id": str(commit.id),
        "project_id": str(commit.project_id) if commit.project_id else None,
        "stage": commit.stage.value if commit.stage else None,
        "author_id": commit.author_id,
        "message": commit.message,
        "changes": commit.changes or {},
        "created_at": commit.created_at.isoformat() if commit.created_at else None,
    }


def activity_to_dict(activity) -> Dict[str, Any]:
    """
    Convert Activity model to dictionary for API response.
    
    Args:
        activity: Activity model instance
        
    Returns:
        Dictionary representation
    """
    return {
        "id": str(activity.id),
        "project_id": str(activity.project_id) if activity.project_id else None,
        "user_id": activity.user_id,
        "action": activity.action,
        "details": activity.details or {},
        "created_at": activity.created_at.isoformat() if activity.created_at else None,
    }


def gate_review_to_dict(review) -> Dict[str, Any]:
    """
    Convert GateReview model to dictionary for API response.
    
    Args:
        review: GateReview model instance
        
    Returns:
        Dictionary representation
    """
    return {
        "id": str(review.id),
        "project_id": str(review.project_id) if review.project_id else None,
        "stage": review.stage.value if review.stage else None,
        "status": review.status.value if review.status else None,
        "reviewer_id": review.reviewer_id,
        "comments": review.comments,
        "checklist": review.checklist or {},
        "created_at": review.created_at.isoformat() if review.created_at else None,
        "updated_at": review.updated_at.isoformat() if review.updated_at else None,
    }


def chat_message_to_dict(message) -> Dict[str, Any]:
    """
    Convert ChatMessage model to dictionary for API response.
    
    Args:
        message: ChatMessage model instance
        
    Returns:
        Dictionary representation
    """
    return {
        "id": str(message.id),
        "project_id": str(message.project_id) if message.project_id else None,
        "stage": message.stage.value if message.stage else None,
        "role": message.role,
        "content": message.content,
        "meta_data": message.meta_data or {},
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }