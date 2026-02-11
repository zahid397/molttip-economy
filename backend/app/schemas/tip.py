from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.agent import PyObjectId


class TipBase(BaseModel):
    to_wallet: str
    amount: float
    reason: Optional[str] = None


class TipCreate(TipBase):
    pass


class TipInDB(TipBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    from_wallet: str
    tx_hash: Optional[str] = None
    verified: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )


class TipResponse(TipInDB):
    pass
