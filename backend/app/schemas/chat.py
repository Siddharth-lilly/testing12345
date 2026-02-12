# app/schemas/chat.py - Chat schemas
"""
Pydantic schemas for the AI specialist chat system.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ChatMessageRequest(BaseModel):
    """Request schema for sending a chat message."""
    project_id: str
    stage: str
    message: str


class ChatMessageResponse(BaseModel):
    """Response schema for a single chat message."""
    id: str
    role: str
    content: str
    created_at: str


class SendChatResponse(BaseModel):
    """Response schema for sending a chat message."""
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse


class ChatHistoryResponse(BaseModel):
    """Response schema for chat history."""
    project_id: str
    stage: str
    messages: List[ChatMessageResponse]


class ClearChatResponse(BaseModel):
    """Response schema for clearing chat history."""
    deleted: int
    project_id: str
    stage: str
