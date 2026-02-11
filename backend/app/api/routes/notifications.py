from fastapi import APIRouter, Depends, Query, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.notification import NotificationResponse
from app.schemas.response import PaginatedResponse
from app.api.deps import get_current_user
from app.services.notification_service import get_user_notifications, mark_as_read
from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[NotificationResponse])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    skip = (page - 1) * per_page
    wallet = current_user["wallet_address"].lower()

    notifs = await get_user_notifications(wallet, limit=per_page, skip=skip)

    total = await db.notifications.count_documents({"user_id": wallet})

    formatted = [
        NotificationResponse(
            id=str(n["_id"]),
            user_id=n["user_id"],
            type=n["type"],
            content=n["content"],
            read=n.get("read", False),
            created_at=n["created_at"],
        )
        for n in notifs
    ]

    return PaginatedResponse[NotificationResponse](
        success=True,
        message="Notifications fetched",
        data=formatted,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.post("/{notification_id}/read")
async def read_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    wallet = current_user["wallet_address"].lower()

    success = await mark_as_read(notification_id, wallet)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or already read",
        )

    return {"success": True, "message": "Notification marked as read"}
