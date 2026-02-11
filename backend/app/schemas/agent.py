from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AgentStats(BaseModel):
    total_tips_received: int = 0
    total_tips_given: int = 0
    total_tip_amount_received: float = 0.0
    total_tip_amount_given: float = 0.0
    post_count: int = 0
    comment_count: int = 0


class AgentProfile(BaseModel):
    wallet_address: str
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    verified: bool = False
    stats: AgentStats
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgentUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = Field(default=None, max_length=500)
    avatar_url: Optional[str] = None
