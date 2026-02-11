from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class AgentRole(str, Enum):
    USER = "user"
    CREATOR = "creator"
    ADMIN = "admin"

class AgentCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r"[^@]+@[^@]+\.[^@]+")
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    profile_image: Optional[str] = None
    wallet_address: Optional[str] = None

class AgentUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    profile_image: Optional[str] = None
    website: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None

class AgentResponse(BaseModel):
    id: str
    username: str
    email: str
    display_name: Optional[str]
    bio: Optional[str]
    profile_image: Optional[str]
    wallet_address: Optional[str]
    wallet_balance: float = 0.0
    total_tips_received: float = 0.0
    total_tips_sent: float = 0.0
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    role: AgentRole = AgentRole.USER
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

class AgentPublicProfile(BaseModel):
    id: str
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    profile_image: Optional[str]
    wallet_address: Optional[str]
    wallet_balance: float = 0.0
    total_tips_received: float = 0.0
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    is_verified: bool = False
    created_at: datetime
