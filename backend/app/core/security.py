# app/core/security.py - Security utilities
"""
Encryption and security utilities for sensitive data handling.
Uses Fernet symmetric encryption for GitHub tokens.
"""

from cryptography.fernet import Fernet

from app.config import settings


def _get_cipher() -> Fernet:
    """Get or create Fernet cipher instance."""
    key = settings.encryption_key
    if key is None:
        # Generate a new key if not provided (development only)
        key = Fernet.generate_key()
    elif isinstance(key, str):
        key = key.encode()
    return Fernet(key)


# Initialize cipher
_cipher = _get_cipher()


def encrypt_token(token: str) -> str:
    """
    Encrypt a sensitive token for secure storage.
    
    Args:
        token: Plain text token to encrypt
        
    Returns:
        Base64-encoded encrypted token
    """
    return _cipher.encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    """
    Decrypt a previously encrypted token.
    
    Args:
        encrypted: Base64-encoded encrypted token
        
    Returns:
        Decrypted plain text token
    """
    return _cipher.decrypt(encrypted.encode()).decode()
