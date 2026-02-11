from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.models.tip import TipStatus


class TipResponse(BaseModel):
    id: str
    txHash: str
    fromAddress: str
    fromUsername: Optional[str] = None
    toAddress: str
    toUsername: Optional[str] = None
    postId: str
    postContent: Optional[str] = None
    amount: float
    tokenSymbol: str
    message: Optional[str] = None
    status: TipStatus
    blockNumber: Optional[int] = None
    confirmedAt: Optional[datetime] = None
    createdAt: datetime


class TipListResponse(BaseModel):
    tips: List[TipResponse]
    total: int
    page: int
    pageSize: int


class TipCreateRequest(BaseModel):
    txHash: str = Field(..., min_length=66, max_length=66)
    fromAddress: str
    toAddress: str
    postId: str
    amount: float = Field(..., gt=0)
    tokenSymbol: str = Field(default="ETH", min_length=1, max_length=10)
    message: Optional[str] = Field(default=None, max_length=500)


class TipVerificationRequest(BaseModel):
    txHash: str = Field(..., min_length=66, max_length=66)
    fromAddress: str
    toAddress: str
    amount: float = Field(..., gt=0)
    tokenSymbol: str = Field(..., min_length=1, max_length=10)
