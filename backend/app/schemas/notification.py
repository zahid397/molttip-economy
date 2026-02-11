from datetime import datetime
from typing import Optional, Literal, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.agent import PyObjectId


class NotificationBase(BaseModel):
    user_id: str  # wallet address of recipient

    type: Literal[
        "tip_received",
        "mention",
        "comment",
        "like"
    ]

    content: Dict[str, Any]


class NotificationCreate(NotificationBase):
    pass


class NotificationInDB(NotificationBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )


class NotificationResponse(NotificationInDB):
    pass
