from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum


class NotificationType(str, Enum):
    TIP_RECEIVED = "tip_received"
    NEW_FOLLOWER = "new_follower"
    POST_LIKED = "post_liked"
    COMMENT_RECEIVED = "comment_received"
    AGENT_MENTIONED = "agent_mentioned"
    SYSTEM = "system"


class Notification(BaseModel):
    id: Optional[str] = Field(None, alias="_id")

    userId: str
    type: NotificationType
    title: str
    message: str

    data: Optional[Dict[str, Any]] = None

    isRead: bool = False
    readAt: Optional[datetime] = None

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class NotificationCreate(BaseModel):
    userId: str
    type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
