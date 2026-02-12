# app/services/ai_service.py - AI service for Azure OpenAI
"""
Service for interacting with Azure OpenAI API.
"""

import os
from typing import List, Dict, Any, Optional

from fastapi import HTTPException
from openai import AzureOpenAI

from app.config import settings


class AIService:
    """
    Service for AI generation using Azure OpenAI.
    
    Wraps the Azure OpenAI client and provides convenient methods
    for text generation with error handling.
    """
    
    def __init__(self):
        """Initialize the Azure OpenAI client."""
        self.client = AzureOpenAI(
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
        )
        self.model = settings.azure_openai_deployment
    
    @property
    def is_configured(self) -> bool:
        """Check if AI service is properly configured."""
        return settings.is_openai_configured
    
    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 4000,
        temperature: float = 0.7
    ) -> str:
        """
        Generate text using Azure OpenAI.
        
        Args:
            system_prompt: System prompt defining AI behavior
            user_message: User's input message
            max_tokens: Maximum tokens in response
            temperature: Creativity parameter (0-1)
            
        Returns:
            Generated text content
            
        Raises:
            HTTPException: If AI generation fails
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            
            if hasattr(response, 'choices') and len(response.choices) > 0:
                if hasattr(response.choices[0], 'message'):
                    return response.choices[0].message.content
                elif hasattr(response.choices[0], 'text'):
                    return response.choices[0].text
            
            raise ValueError("Unexpected response structure from Azure OpenAI")
            
        except Exception as e:
            print(f"❌ Azure OpenAI Error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Azure OpenAI API error: {str(e)}"
            )
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> tuple[str, Optional[int]]:
        """
        Generate a chat response with message history.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens in response
            temperature: Creativity parameter (0-1)
            
        Returns:
            Tuple of (response content, total tokens used)
            
        Raises:
            HTTPException: If AI generation fails
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=messages
            )
            
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else None
            
            return content, tokens
            
        except Exception as e:
            print(f"❌ Azure OpenAI Chat Error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"AI API error: {str(e)}"
            )


# Global AI service instance
ai_service = AIService()


async def generate_with_openai(
    system_prompt: str,
    user_message: str,
    max_tokens: int = 4000
) -> str:
    """
    Convenience function for AI generation.
    Maintains backward compatibility with original main.py function.
    
    Args:
        system_prompt: System prompt for AI behavior
        user_message: User's input message
        max_tokens: Maximum response tokens
        
    Returns:
        Generated text content
    """
    return await ai_service.generate(system_prompt, user_message, max_tokens)
