# app/utils/chat_context.py - Chat context utilities
"""
Shared utilities for formatting chat history as context for AI prompts.
All stage services should use these functions to ensure consistent 
and robust chat context is provided to the LLM for document generation.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_message import ChatMessage
from app.models.enums import StageType


# Stage display names for formatting
STAGE_DISPLAY_NAMES = {
    StageType.DISCOVER: "🔍 Discovery Phase",
    StageType.DEFINE: "📋 Requirements Phase",
    StageType.DESIGN: "🏗️ Architecture Discussion",
    StageType.DEVELOP: "💻 Development Discussion",
    StageType.TEST: "🧪 Testing Discussion",
    StageType.BUILD: "🔧 Build & CI/CD Discussion",
    StageType.DEPLOY: "🚀 Deployment Discussion"
}

STAGE_DESCRIPTIONS = {
    StageType.DISCOVER: "Problem understanding, stakeholders, and scope",
    StageType.DEFINE: "Requirements, features, and business rules",
    StageType.DESIGN: "Technical architecture and system design",
    StageType.DEVELOP: "Implementation details and coding decisions",
    StageType.TEST: "Testing strategies and quality assurance",
    StageType.BUILD: "CI/CD and infrastructure setup",
    StageType.DEPLOY: "Release planning and deployment"
}


async def get_chat_history_for_stage(
    db: AsyncSession,
    project_id: str,
    stage: StageType,
    limit: int = 100
) -> List[Dict[str, str]]:
    """
    Fetch chat history for a specific project stage.
    
    Args:
        db: Database session
        project_id: ID of the project
        stage: The SDLC stage
        limit: Maximum number of messages to fetch
        
    Returns:
        List of chat messages with role and content
    """
    result = await db.execute(
        select(ChatMessage)
        .where(
            and_(
                ChatMessage.project_id == project_id,
                ChatMessage.stage == stage
            )
        )
        .order_by(ChatMessage.created_at)
        .limit(limit)
    )
    messages = result.scalars().all()
    
    return [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]


async def get_all_chat_history(
    db: AsyncSession,
    project_id: str,
    stages: Optional[List[StageType]] = None,
    limit_per_stage: int = 50
) -> Dict[StageType, List[Dict[str, str]]]:
    """
    Fetch chat history from multiple stages for comprehensive context.
    
    Args:
        db: Database session
        project_id: ID of the project
        stages: List of stages to fetch (defaults to all)
        limit_per_stage: Maximum messages per stage
        
    Returns:
        Dictionary with stage types as keys and chat messages as values
    """
    if stages is None:
        stages = [
            StageType.DISCOVER, 
            StageType.DEFINE, 
            StageType.DESIGN, 
            StageType.DEVELOP
        ]
    
    all_history = {}
    
    for stage in stages:
        all_history[stage] = await get_chat_history_for_stage(
            db, project_id, stage, limit_per_stage
        )
    
    return all_history


def format_chat_history_for_prompt(
    chat_history: List[Dict[str, str]],
    stage_name: str = "Discussion",
    max_message_length: int = 1500,
    include_header: bool = True
) -> str:
    """
    Format chat history into a structured string for inclusion in prompts.
    
    Args:
        chat_history: List of chat messages with role and content
        stage_name: Name of the stage for the header
        max_message_length: Truncate messages longer than this
        include_header: Whether to include section header
        
    Returns:
        Formatted string of chat history ready for prompt inclusion
    """
    if not chat_history:
        return ""
    
    formatted_parts = []
    
    if include_header:
        formatted_parts.append(f"\n### {stage_name}")
        formatted_parts.append("*Key discussion points and requirements from user conversation:*\n")
    
    for i, msg in enumerate(chat_history, 1):
        role_label = "👤 **USER**" if msg["role"] == "user" else "🤖 **AI SPECIALIST**"
        content = msg['content']
        
        # Truncate very long messages but keep context
        if len(content) > max_message_length:
            content = content[:max_message_length] + "... [truncated]"
        
        formatted_parts.append(f"{role_label}:\n{content}\n")
    
    return "\n".join(formatted_parts)


def format_all_chat_history_for_prompt(
    all_history: Dict[StageType, List[Dict[str, str]]],
    intro_text: Optional[str] = None
) -> str:
    """
    Format chat history from all stages into a comprehensive context string.
    
    This is the main function to use when building prompts that need
    context from multiple stages.
    
    Args:
        all_history: Dictionary of chat history by stage type
        intro_text: Optional custom introduction text
        
    Returns:
        Formatted string of all chat history ready for prompt inclusion
    """
    total_messages = sum(len(msgs) for msgs in all_history.values())
    
    if total_messages == 0:
        return ""
    
    parts = []
    
    # Header section with STRONG emphasis
    if intro_text:
        parts.append(intro_text)
    else:
        parts.append("\n")
        parts.append("╔" + "═" * 70 + "╗")
        parts.append("║" + " " * 15 + "💬 CONVERSATION HISTORY (CRITICAL CONTEXT)" + " " * 14 + "║")
        parts.append("╚" + "═" * 70 + "╝")
        parts.append("")
        parts.append("┌" + "─" * 70 + "┐")
        parts.append("│ ⚠️  MANDATORY INSTRUCTION: You MUST incorporate ALL relevant         │")
        parts.append("│    information from the conversations below into your output.       │")
        parts.append("├" + "─" * 70 + "┤")
        parts.append("│ The user has already discussed these details with the AI specialist │")
        parts.append("│ and expects ALL of it to appear in the generated document.         │")
        parts.append("│                                                                      │")
        parts.append("│ EXTRACT AND INCLUDE:                                                 │")
        parts.append("│ • Specific requirements mentioned                                    │")
        parts.append("│ • Business rules and constraints                                     │")
        parts.append("│ • Technical preferences                                              │")
        parts.append("│ • Priorities (high/low)                                              │")
        parts.append("│ • Stakeholders identified                                            │")
        parts.append("│ • Edge cases discussed                                               │")
        parts.append("│ • Exact terminology/field names used                                 │")
        parts.append("└" + "─" * 70 + "┘")
        parts.append("")
        parts.append(f"📊 **Total messages across all stages: {total_messages}**")
        parts.append("")
    
    # Format each stage's history
    for stage_type, messages in all_history.items():
        if messages:
            stage_display = STAGE_DISPLAY_NAMES.get(stage_type, stage_type.value.title())
            stage_desc = STAGE_DESCRIPTIONS.get(stage_type, "")
            
            header = f"{stage_display}"
            if stage_desc:
                header += f" ({stage_desc})"
            
            parts.append(format_chat_history_for_prompt(
                messages, 
                header,
                include_header=True
            ))
            parts.append("─" * 50)
    
    # Footer instruction with checklist
    parts.append("")
    parts.append("┌" + "─" * 70 + "┐")
    parts.append("│ ✅ CHECKLIST - Before finalizing your response, verify:              │")
    parts.append("├" + "─" * 70 + "┤")
    parts.append("│ □ Have I included ALL specific requirements from conversations?      │")
    parts.append("│ □ Have I used the EXACT terminology the user used?                   │")
    parts.append("│ □ Have I addressed ALL constraints mentioned (budget, timeline)?     │")
    parts.append("│ □ Have I included ALL stakeholders identified?                       │")
    parts.append("│ □ Have I noted the priorities the user indicated?                    │")
    parts.append("│ □ Have I covered edge cases and scenarios discussed?                 │")
    parts.append("│ □ Have I respected technical preferences stated?                     │")
    parts.append("└" + "─" * 70 + "┘")
    parts.append("")
    
    return "\n".join(parts)


def extract_key_points_from_history(
    chat_history: List[Dict[str, str]]
) -> Dict[str, List[str]]:
    """
    Helper to extract key points from chat history.
    This provides a structured summary that can be used alongside the full context.
    
    Args:
        chat_history: List of chat messages
        
    Returns:
        Dictionary with categorized key points
    """
    # Initialize categories
    key_points = {
        "requirements": [],
        "constraints": [],
        "preferences": [],
        "priorities": [],
        "stakeholders": [],
        "technical": [],
        "questions_answered": []
    }
    
    # Extract user messages (these contain the requirements)
    user_messages = [msg for msg in chat_history if msg["role"] == "user"]
    
    # Simple extraction based on message content
    # In a more sophisticated implementation, you could use NLP here
    for msg in user_messages:
        content = msg["content"].lower()
        original = msg["content"]
        
        # Look for requirement indicators
        if any(word in content for word in ["must", "need", "should", "require", "want", "has to", "we need"]):
            key_points["requirements"].append(original[:300])
        
        # Look for constraint indicators
        if any(word in content for word in ["budget", "timeline", "deadline", "can't", "cannot", "limit", "maximum", "minimum", "by", "within"]):
            key_points["constraints"].append(original[:300])
        
        # Look for preference indicators
        if any(word in content for word in ["prefer", "like", "want to use", "rather", "ideally", "would be nice"]):
            key_points["preferences"].append(original[:300])
        
        # Look for priority indicators
        if any(word in content for word in ["important", "critical", "priority", "first", "later", "mvp", "essential", "nice to have"]):
            key_points["priorities"].append(original[:300])
        
        # Look for stakeholder indicators
        if any(word in content for word in ["user", "admin", "manager", "team", "department", "customer", "client", "stakeholder", "role"]):
            key_points["stakeholders"].append(original[:300])
        
        # Look for technical indicators
        if any(word in content for word in ["api", "database", "frontend", "backend", "server", "cloud", "aws", "azure", "react", "python", "authentication"]):
            key_points["technical"].append(original[:300])
    
    # Remove duplicates while preserving order
    for category in key_points:
        seen = set()
        unique = []
        for item in key_points[category]:
            if item not in seen:
                seen.add(item)
                unique.append(item)
        key_points[category] = unique[:10]  # Limit to 10 per category
    
    return key_points


def count_chat_messages(
    all_history: Dict[StageType, List[Dict[str, str]]]
) -> Dict[str, Any]:
    """
    Get statistics about chat history.
    
    Args:
        all_history: Dictionary of chat history by stage type
        
    Returns:
        Statistics about the chat history
    """
    stats = {
        "total_messages": 0,
        "by_stage": {},
        "user_messages": 0,
        "assistant_messages": 0
    }
    
    for stage_type, messages in all_history.items():
        stage_count = len(messages)
        stats["by_stage"][stage_type.value] = stage_count
        stats["total_messages"] += stage_count
        
        for msg in messages:
            if msg["role"] == "user":
                stats["user_messages"] += 1
            else:
                stats["assistant_messages"] += 1
    
    return stats


def format_key_points_for_prompt(key_points: Dict[str, List[str]]) -> str:
    """
    Format extracted key points into a concise summary for prompts.
    
    Args:
        key_points: Dictionary of categorized key points
        
    Returns:
        Formatted string summarizing key points
    """
    parts = []
    parts.append("\n### 📌 KEY POINTS EXTRACTED FROM CONVERSATIONS")
    parts.append("*These are the most important items identified from user discussions:*\n")
    
    category_labels = {
        "requirements": "📋 Requirements Mentioned",
        "constraints": "⚠️ Constraints Identified", 
        "preferences": "💡 User Preferences",
        "priorities": "🎯 Priorities Stated",
        "stakeholders": "👥 Stakeholders Mentioned",
        "technical": "🔧 Technical Details"
    }
    
    for category, label in category_labels.items():
        items = key_points.get(category, [])
        if items:
            parts.append(f"**{label}:**")
            for item in items[:5]:  # Show top 5
                truncated = item[:150] + "..." if len(item) > 150 else item
                parts.append(f"  • {truncated}")
            parts.append("")
    
    return "\n".join(parts)