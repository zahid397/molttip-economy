from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: str
    userId: str
    type: NotificationType
    title: str
    message: str
    data: Optional[dict] = None
    isRead: bool = False
    readAt: Optional[datetime] = None
    createdAt: datetime


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    pageSize: int
    unreadCount: int


class NotificationUpdateRequest(BaseModel):
    isRead: Optional[bool] = None
