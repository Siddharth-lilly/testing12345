# app/prompts/__init__.py
"""
AI prompts for all SDLC stages.
"""

from app.prompts.discover_prompts import (
    PROBLEM_STATEMENT_PROMPT,
    STAKEHOLDER_ANALYSIS_PROMPT,
)
from app.prompts.define_prompts import (
    BRD_WITH_CONTEXT_PROMPT,
    TECH_WRITER_PROMPT,
)
from app.prompts.design_prompts import (
    DESIGN_SYSTEM_PROMPT,
    DESIGN_USER_PROMPT_TEMPLATE,
)
from app.prompts.develop_prompts import (
    DEVELOP_TICKETS_SYSTEM_PROMPT,
    DEVELOP_TICKETS_USER_PROMPT,
    IMPLEMENT_TICKET_SYSTEM_PROMPT,
    IMPLEMENT_TICKET_USER_PROMPT,
)
from app.prompts.test_prompts import (
    TEST_PLAN_SYSTEM_PROMPT,
    TEST_PLAN_USER_PROMPT,
    TEST_CASES_SYSTEM_PROMPT,
    TEST_CASES_USER_PROMPT,
    RUN_TESTS_SYSTEM_PROMPT,
    RUN_TESTS_USER_PROMPT,
)
from app.prompts.chat_prompts import (
    CHAT_SYSTEM_PROMPTS,
    get_chat_system_prompt,
)

__all__ = [
    # Discover
    "PROBLEM_STATEMENT_PROMPT",
    "STAKEHOLDER_ANALYSIS_PROMPT",
    # Define
    "BRD_WITH_CONTEXT_PROMPT",
    "TECH_WRITER_PROMPT",
    # Design
    "DESIGN_SYSTEM_PROMPT",
    "DESIGN_USER_PROMPT_TEMPLATE",
    # Develop
    "DEVELOP_TICKETS_SYSTEM_PROMPT",
    "DEVELOP_TICKETS_USER_PROMPT",
    "IMPLEMENT_TICKET_SYSTEM_PROMPT",
    "IMPLEMENT_TICKET_USER_PROMPT",
    # Test
    "TEST_PLAN_SYSTEM_PROMPT",
    "TEST_PLAN_USER_PROMPT",
    "TEST_CASES_SYSTEM_PROMPT",
    "TEST_CASES_USER_PROMPT",
    "RUN_TESTS_SYSTEM_PROMPT",
    "RUN_TESTS_USER_PROMPT",
    # Chat
    "CHAT_SYSTEM_PROMPTS",
    "get_chat_system_prompt",
]