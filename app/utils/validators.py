import re
from typing import Optional

def validate_username(username: str) -> bool:
    """Validate username format"""
    if not username or len(username) < 3 or len(username) > 50:
        return False
    return bool(re.match(r'^[a-zA-Z0-9_]+$', username))

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, None

def sanitize_content(content: str) -> str:
    """Sanitize post/comment content"""
    # Remove excessive whitespace
    content = ' '.join(content.split())
    
    # Basic XSS prevention
    content = content.replace('<', '&lt;').replace('>', '&gt;')
    
    # Limit length
    if len(content) > 280:
        content = content[:277] + "..."
    
    return content

def extract_mentions(content: str) -> list[str]:
    """Extract @mentions from content"""
    mentions = re.findall(r'@([a-zA-Z0-9_]+)', content)
    return list(set(mentions))

def extract_hashtags(content: str) -> list[str]:
    """Extract #hashtags from content"""
    hashtags = re.findall(r'#([a-zA-Z0-9_]+)', content)
    return list(set(hashtags))
