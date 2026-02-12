# app/models/chat_message.py - ChatMessage model
"""
ChatMessage model representing AI specialist chat messages.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Text, DateTime, JSON, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.enums import StageType


class ChatMessage(Base):
    """
    Represents a chat message in the AI specialist conversation.
    
    Each stage has its own AI specialist that users can chat with
    for guidance and clarification.
    
    Attributes:
        id: Unique message identifier
        project_id: Parent project ID
        stage: Stage this conversation belongs to
        role: Message role ('user' or 'assistant')
        content: Message content
        created_at: Message timestamp
        meta_data: Additional metadata (model, tokens, etc.)
    """
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(String(255), ForeignKey("projects.id"), nullable=False)
    stage = Column(SQLEnum(StageType), nullable=False)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(JSON, default=dict)
    
    def __repr__(self) -> str:
        return f"<ChatMessage(id={self.id}, role='{self.role}', stage={self.stage})>"
