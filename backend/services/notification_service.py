import logging
from typing import Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import db
from app.models.notification import Notification, NotificationType

logger = logging.getLogger(__name__)


class NotificationService:

    @staticmethod
    async def create_notification(
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Create a new notification"""
        try:
            notification = Notification(
                userId=user_id,
                type=notification_type,
                title=title,
                message=message,
                data=data,
                createdAt=datetime.utcnow()
            )

            result = await db.database.notifications.insert_one(
                notification.dict(by_alias=True, exclude_none=True)
            )

            return str(result.inserted_id)

        except Exception as e:
            logger.error(f"Create notification error: {e}")
            return None

    @staticmethod
    async def create_tip_notification(
        tip_id: str,
        from_address: str,
        to_address: str,
        amount: float,
        post_id: str,
        message: Optional[str] = None
    ) -> Optional[str]:
        """Create notification for tip received"""
        try:
            to_address = to_address.lower()
            from_address = from_address.lower()

            agent = await db.database.agents.find_one(
                {"walletAddress": to_address}
            )
            if not agent:
                return None

            sender = await db.database.agents.find_one(
                {"walletAddress": from_address}
            )
            sender_name = sender.get("username") if sender else from_address[:6] + "..."

            title = "💰 New Tip Received!"
            notification_message = f"{sender_name} sent you {amount} ETH"
            if message:
                notification_message += f": {message}"

            return await NotificationService.create_notification(
                user_id=str(agent["_id"]),
                notification_type=NotificationType.TIP_RECEIVED,
                title=title,
                message=notification_message,
                data={
                    "tipId": tip_id,
                    "fromAddress": from_address,
                    "amount": amount,
                    "postId": post_id,
                    "message": message
                }
            )

        except Exception as e:
            logger.error(f"Create tip notification error: {e}")
            return None

    @staticmethod
    async def get_user_notifications(
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        unread_only: bool = False
    ) -> Dict[str, Any]:
        """Get notifications for a user"""
        try:
            skip = (page - 1) * page_size

            query = {"userId": user_id}
            if unread_only:
                query["isRead"] = False

            cursor = (
                db.database.notifications
                .find(query)
                .sort("createdAt", -1)
                .skip(skip)
                .limit(page_size)
            )

            notifications = await cursor.to_list(length=page_size)

            total = await db.database.notifications.count_documents(query)
            unread_count = await db.database.notifications.count_documents(
                {"userId": user_id, "isRead": False}
            )

            formatted = []
            for n in notifications:
                n["id"] = str(n["_id"])
                del n["_id"]
                formatted.append(n)

            return {
                "notifications": formatted,
                "total": total,
                "page": page,
                "pageSize": page_size,
                "unreadCount": unread_count,
                "hasMore": total > (skip + page_size)
            }

        except Exception as e:
            logger.error(f"Get user notifications error: {e}")
            return {
                "notifications": [],
                "total": 0,
                "page": page,
                "pageSize": page_size,
                "unreadCount": 0,
                "hasMore": False
            }

    @staticmethod
    async def mark_as_read(notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            if not ObjectId.is_valid(notification_id):
                return False

            result = await db.database.notifications.update_one(
                {
                    "_id": ObjectId(notification_id),
                    "userId": user_id
                },
                {"$set": {"isRead": True, "readAt": datetime.utcnow()}}
            )

            return result.modified_count > 0

        except Exception as e:
            logger.error(f"Mark as read error: {e}")
            return False

    @staticmethod
    async def mark_all_as_read(user_id: str) -> bool:
        """Mark all notifications as read"""
        try:
            result = await db.database.notifications.update_many(
                {"userId": user_id, "isRead": False},
                {"$set": {"isRead": True, "readAt": datetime.utcnow()}}
            )
            return result.modified_count > 0

        except Exception as e:
            logger.error(f"Mark all as read error: {e}")
            return False

    @staticmethod
    async def delete_notification(notification_id: str, user_id: str) -> bool:
        """Delete a notification"""
        try:
            if not ObjectId.is_valid(notification_id):
                return False

            result = await db.database.notifications.delete_one(
                {
                    "_id": ObjectId(notification_id),
                    "userId": user_id
                }
            )
            return result.deleted_count > 0

        except Exception as e:
            logger.error(f"Delete notification error: {e}")
            return False


notification_service = NotificationService()
