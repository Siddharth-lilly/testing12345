# tests/test_services.py
"""
Tests for Service layer.
"""

import pytest


class TestAIService:
    """Tests for AI Service."""
    
    @pytest.mark.asyncio
    async def test_generate(self, test_db):
        """Test AI generation."""
        # TODO: Implement (requires mocking Azure OpenAI)
        pass


class TestGitHubService:
    """Tests for GitHub Service."""
    
    @pytest.mark.asyncio
    async def test_validate_config(self, test_db):
        """Test GitHub config validation."""
        # TODO: Implement (requires mocking GitHub API)
        pass
    
    @pytest.mark.asyncio
    async def test_save_config(self, test_db):
        """Test saving GitHub config."""
        # TODO: Implement
        pass


class TestChatService:
    """Tests for Chat Service."""
    
    @pytest.mark.asyncio
    async def test_send_message(self, test_db):
        """Test sending chat message."""
        # TODO: Implement
        pass
    
    @pytest.mark.asyncio
    async def test_get_history(self, test_db):
        """Test getting chat history."""
        # TODO: Implement
        pass
