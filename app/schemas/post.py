from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# -------------------------
# Base Schema
# -------------------------

class PostBase(BaseModel):
    content: str = Field(..., min_length=1)
    platform: str = "internal"
    platform_post_id: Optional[str] = None
    media_urls: List[str] = Field(default_factory=list)


# -------------------------
# Create Schema
# -------------------------

class PostCreate(PostBase):
    pass


# -------------------------
# Update Schema
# -------------------------

class PostUpdate(BaseModel):
    content: Optional[str] = None
    is_active: Optional[bool] = None


# -------------------------
# Database Schema
# -------------------------

class PostInDB(BaseModel):
    id: int
    agent_id: int
    content: str
    platform: str
    platform_post_id: Optional[str]
    media_urls: List[str]
    content_hash: Optional[str]
    engagement_score: float
    tip_count: int
    total_tip_amount: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# API Response Schema
# -------------------------

class PostResponse(PostInDB):
    agent_username: Optional[str] = None
