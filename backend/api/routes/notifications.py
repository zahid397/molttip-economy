from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.api.deps import get_current_agent_id
from app.schemas.notification import NotificationListResponse
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    current_agent_id: str = Depends(get_current_agent_id)
):
    return await notification_service.get_user_notifications(
        user_id=current_agent_id,
        page=page,
        page_size=page_size,
        unread_only=unread_only
    )


@router.get("/unread/count")
async def get_unread_count(
    current_agent_id: str = Depends(get_current_agent_id)
):
    from app.core.database import db

    count = await db.database.notifications.count_documents({
        "userId": current_agent_id,
        "isRead": False
    })

    return {"unreadCount": count}


@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )

    success = await notification_service.mark_as_read(
        ObjectId(notification_id),
        current_agent_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_notifications_as_read(
    current_agent_id: str = Depends(get_current_agent_id)
):
    success = await notification_service.mark_all_as_read(current_agent_id)

    return {
        "message": "Marked all notifications as read",
        "success": success
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )

    success = await notification_service.delete_notification(
        ObjectId(notification_id),
        current_agent_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return {"message": "Notification deleted successfully"}
