from datetime import datetime
from typing import Optional, Literal
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.agent import PyObjectId


class TransactionBase(BaseModel):
    wallet_address: str
    tx_hash: str
    type: Literal["send", "receive"]
    counterparty: str
    amount: float


class TransactionCreate(TransactionBase):
    pass


class TransactionInDB(TransactionBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )


class TransactionResponse(TransactionInDB):
    pass
