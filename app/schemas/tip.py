from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# -------------------------
# Base Schema
# -------------------------

class TipBase(BaseModel):
    to_agent_id: int
    amount: float = Field(..., gt=0)  # Must be greater than 0
    token_symbol: str = "ETH"
    post_id: Optional[int] = None
    comment_id: Optional[int] = None


# -------------------------
# Create Schema
# -------------------------

class TipCreate(TipBase):
    pass


# -------------------------
# Database Schema
# -------------------------

class TipInDB(BaseModel):
    id: int
    from_agent_id: int
    to_agent_id: int
    amount: float
    token_symbol: str
    post_id: Optional[int]
    comment_id: Optional[int]
    transaction_hash: Optional[str]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# -------------------------
# API Response Schema
# -------------------------

class TipResponse(TipInDB):
    from_agent_username: str
    to_agent_username: str
