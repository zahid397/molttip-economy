from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import logging
from app.core.database import notifications_collection, agents_collection
from app.schemas.notification import NotificationCreate, NotificationType
from app.utils.response import Response

logger = logging.getLogger(__name__)

class NotificationService:
    async def create_notification(self, user_id: str, type: str, title: str, message: str,
                                 data: Optional[dict] = None, related_user_id: Optional[str] = None,
                                 related_post_id: Optional[str] = None, related_comment_id: Optional[str] = None,
                                 related_tip_id: Optional[str] = None) -> bool:
        """Create a new notification"""
        try:
            # Check user notification preferences
            agent = await agents_collection.find_one({"_id": ObjectId(user_id)})
            if not agent:
                return False
            
            prefs = agent.get("notification_preferences", {})
            
            # Check if this type of notification is enabled
            notification_key = f"in_app_{type.split('_')[0]}s" if "_" in type else f"in_app_{type}s"
            if not prefs.get(notification_key, True):
                return False
            
            notification = {
                "user_id": user_id,
                "type": type,
                "title": title,
                "message": message,
                "data": data or {},
                "related_user_id": related_user_id,
                "related_post_id": related_post_id,
                "related_comment_id": related_comment_id,
                "related_tip_id": related_tip_id,
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            
            await notifications_collection.insert_one(notification)
            
            # Here you would also send push/email notifications based on preferences
            # For now, we just create in-app notifications
            
            return True
            
        except Exception as e:
            logger.error(f"Create notification error: {e}")
            return False
    
    async def get_user_notifications(self, user_id: str, unread_only: bool = False,
                                     page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get notifications for a user"""
        try:
            skip = (page - 1) * limit
            
            query = {"user_id": user_id}
            if unread_only:
                query["is_read"] = False
            
            total = await notifications_collection.count_documents(query)
            notifications = await notifications_collection.find(query) \
                .sort("created_at", -1) \
                .skip(skip) \
                .limit(limit) \
                .to_list(length=limit)
            
            # Convert ObjectId to string
            for notification in notifications:
                notification["id"] = str(notification["_id"])
                del notification["_id"]
            
            # Mark as read if not unread_only
            if not unread_only and page == 1:
                unread_ids = [ObjectId(n["id"]) for n in notifications if not n.get("is_read")]
                if unread_ids:
                    await notifications_collection.update_many(
                        {"_id": {"$in": unread_ids}},
                        {"$set": {"is_read": True}}
                    )
            
            return Response.success(
                message="Notifications retrieved",
                data={
                    "notifications": notifications,
                    "total": total,
                    "unread_count": await self.get_unread_count(user_id),
                    "page": page,
                    "limit": limit,
                    "pages": (total + limit - 1) // limit
                }
            )
            
        except Exception as e:
            logger.error(f"Get notifications error: {e}")
            return Response.error("Failed to get notifications")
    
    async def mark_as_read(self, user_id: str, notification_id: str = None) -> Dict[str, Any]:
        """Mark notifications as read"""
        try:
            query = {"user_id": user_id}
            if notification_id:
                query["_id"] = ObjectId(notification_id)
            else:
                query["is_read"] = False
            
            result = await notifications_collection.update_many(
                query,
                {"$set": {"is_read": True}}
            )
            
            return Response.success(
                message="Notifications marked as read",
                data={"modified_count": result.modified_count}
            )
            
        except Exception as e:
            logger.error(f"Mark as read error: {e}")
            return Response.error("Failed to mark notifications as read")
    
    async def delete_notification(self, user_id: str, notification_id: str) -> Dict[str, Any]:
        """Delete a notification"""
        try:
            result = await notifications_collection.delete_one({
                "_id": ObjectId(notification_id),
                "user_id": user_id
            })
            
            if result.deleted_count == 0:
                return Response.error("Notification not found")
            
            return Response.success(
                message="Notification deleted",
                data={"deleted_count": result.deleted_count}
            )
            
        except Exception as e:
            logger.error(f"Delete notification error: {e}")
            return Response.error("Failed to delete notification")
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        try:
            count = await notifications_collection.count_documents({
                "user_id": user_id,
                "is_read": False
            })
            return count
        except Exception as e:
            logger.error(f"Get unread count error: {e}")
            return 0
    
    async def update_notification_preferences(self, user_id: str, preferences: dict) -> Dict[str, Any]:
        """Update notification preferences"""
        try:
            result = await agents_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"notification_preferences": preferences}}
            )
            
            if result.modified_count == 0:
                return Response.error("Failed to update preferences")
            
            return Response.success(
                message="Notification preferences updated"
            )
            
        except Exception as e:
            logger.error(f"Update preferences error: {e}")
            return Response.error("Failed to update preferences")
