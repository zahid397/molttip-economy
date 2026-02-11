from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    TIP_RECEIVED = "tip_received"
    TIP_SENT = "tip_sent"
    NEW_FOLLOWER = "new_follower"
    POST_LIKE = "post_like"
    COMMENT_LIKE = "comment_like"
    NEW_COMMENT = "new_comment"
    COMMENT_REPLY = "comment_reply"
    POST_MENTION = "post_mention"
    COMMENT_MENTION = "comment_mention"
    RETWEET = "retweet"
    ACHIEVEMENT = "achievement"
    SYSTEM = "system"

class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: Optional[dict] = None
    related_user_id: Optional[str] = None
    related_post_id: Optional[str] = None
    related_comment_id: Optional[str] = None
    related_tip_id: Optional[str] = None

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: Optional[dict]
    related_user_id: Optional[str]
    related_post_id: Optional[str]
    related_comment_id: Optional[str]
    related_tip_id: Optional[str]
    is_read: bool = False
    created_at: datetime

class NotificationPreferences(BaseModel):
    email_tips: bool = True
    email_follows: bool = True
    email_likes: bool = True
    email_comments: bool = True
    push_tips: bool = True
    push_follows: bool = True
    push_likes: bool = True
    push_comments: bool = True
    in_app_tips: bool = True
    in_app_follows: bool = True
    in_app_likes: bool = True
    in_app_comments: bool = True
