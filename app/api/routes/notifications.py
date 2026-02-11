from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any
from app.api.deps import get_current_user
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationPreferences
from app.utils.response import Response

router = APIRouter(prefix="/notifications", tags=["Notifications"])
notification_service = NotificationService()

@router.get("/", response_model=Dict[str, Any])
async def get_notifications(
    unread_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user notifications"""
    result = await notification_service.get_user_notifications(
        user_id=current_user["id"],
        unread_only=unread_only,
        page=page,
        limit=limit
    )
    return result

@router.get("/unread-count", response_model=Dict[str, Any])
async def get_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get unread notification count"""
    count = await notification_service.get_unread_count(current_user["id"])
    return Response.success(
        message="Unread count retrieved",
        data={"unread_count": count}
    )

@router.post("/mark-read", response_model=Dict[str, Any])
async def mark_all_read(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark all notifications as read"""
    result = await notification_service.mark_as_read(current_user["id"])
    return result

@router.post("/{notification_id}/read", response_model=Dict[str, Any])
async def mark_notification_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark a specific notification as read"""
    result = await notification_service.mark_as_read(current_user["id"], notification_id)
    return result

@router.delete("/{notification_id}", response_model=Dict[str, Any])
async def delete_notification(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a notification"""
    result = await notification_service.delete_notification(current_user["id"], notification_id)
    return result

@router.delete("/", response_model=Dict[str, Any])
async def delete_all_notifications(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete all notifications"""
    from app.core.database import notifications_collection
    
    result = await notifications_collection.delete_many({"user_id": current_user["id"]})
    
    return Response.success(
        message="All notifications deleted",
        data={"deleted_count": result.deleted_count}
    )

@router.get("/preferences", response_model=Dict[str, Any])
async def get_notification_preferences(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get notification preferences"""
    from app.core.database import agents_collection
    
    agent = await agents_collection.find_one({"_id": current_user["_id"]})
    preferences = agent.get("notification_preferences", {})
    
    return Response.success(
        message="Notification preferences retrieved",
        data={"preferences": preferences}
    )

@router.put("/preferences", response_model=Dict[str, Any])
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update notification preferences"""
    result = await notification_service.update_notification_preferences(
        current_user["id"],
        preferences.dict()
    )
    return result
