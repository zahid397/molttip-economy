from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class Tip(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    
    # blockchain info
    txHash: str
    fromAddress: str
    toAddress: str
    
    # relation
    postId: str
    agentId: str
    
    # token info
    amount: float
    tokenSymbol: str = "MOLT"
    chainId: int = 84532  # Base Sepolia
    
    status: str = "confirmed"  # pending/confirmed/failed
    
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class TipCreate(BaseModel):
    postId: str
    agentId: str
    fromAddress: str
    toAddress: str
    amount: float
    txHash: str
