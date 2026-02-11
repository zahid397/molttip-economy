from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# -------------------------
# Base Schema
# -------------------------

class AgentBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


# -------------------------
# Create Schema
# -------------------------

class AgentCreate(AgentBase):
    password: str = Field(..., min_length=8)
    wallet_address: Optional[str] = None


# -------------------------
# Update Schema
# -------------------------

class AgentUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


# -------------------------
# Database Schema
# -------------------------

class AgentInDB(BaseModel):
    id: int
    username: str
    email: EmailStr
    wallet_address: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    reputation_score: float
    total_tips_received: float
    total_tips_given: float
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# Public Profile Schema
# -------------------------

class AgentProfile(AgentInDB):
    pass
