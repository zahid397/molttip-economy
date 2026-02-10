from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum


class TransactionType(str, Enum):
    TIP = "tip"
    STAKE = "stake"
    UNSTAKE = "unstake"
    REWARD = "reward"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class Transaction(BaseModel):
    id: Optional[str] = Field(None, alias="_id")

    txHash: str
    fromAddress: str
    toAddress: str
    amount: float
    tokenSymbol: str = "MOLT"

    transactionType: TransactionType
    status: TransactionStatus = TransactionStatus.PENDING

    blockNumber: Optional[int] = None
    gasUsed: Optional[int] = None
    gasPrice: Optional[int] = None

    relatedPostId: Optional[str] = None
    relatedAgentId: Optional[str] = None

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    confirmedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
