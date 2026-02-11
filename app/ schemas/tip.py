from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TipType(str, Enum):
    POST = "post"
    COMMENT = "comment"
    USER = "user"

class TipCurrency(str, Enum):
    ETH = "ETH"
    MATIC = "MATIC"
    USDC = "USDC"
    MOLT = "MOLT"  # Platform token

class TipCreate(BaseModel):
    receiver_id: str
    amount: float = Field(..., gt=0)
    currency: TipCurrency = TipCurrency.MOLT
    type: TipType = TipType.USER
    target_id: Optional[str] = None  # post_id or comment_id
    message: Optional[str] = Field(None, max_length=200)

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return round(v, 6)

class TipResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    sender_username: str
    receiver_username: str
    amount: float
    currency: TipCurrency
    type: TipType
    target_id: Optional[str]
    message: Optional[str]
    transaction_hash: Optional[str]
    blockchain_verified: bool = False
    created_at: datetime

class TipSummary(BaseModel):
    total_sent: float = 0.0
    total_received: float = 0.0
    total_tips: int = 0
    recent_tips: List[TipResponse] = []
