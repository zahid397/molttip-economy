from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId

from app.core.database import get_db


# -----------------------------------
# Create Notification
# -----------------------------------

async def create_notification(user_id: str, notif_type: str, content: Dict[str, Any]) -> str:
    db = get_db()

    notif_doc = {
        "user_id": user_id.lower(),
        "type": notif_type,
        "content": content,
        "read": False,
        "created_at": datetime.utcnow(),
    }

    result = await db.notifications.insert_one(notif_doc)
    return str(result.inserted_id)


# -----------------------------------
# Get Notifications
# -----------------------------------

async def get_user_notifications(
    user_id: str,
    limit: int = 50,
    skip: int = 0
) -> List[Dict[str, Any]]:

    db = get_db()

    cursor = (
        db.notifications
        .find({"user_id": user_id.lower()})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    notifications = await cursor.to_list(length=limit)

    # Convert ObjectId to string
    for n in notifications:
        n["_id"] = str(n["_id"])

    return notifications


# -----------------------------------
# Mark as Read
# -----------------------------------

async def mark_as_read(notification_id: str, user_id: str) -> bool:
    db = get_db()

    try:
        notif_obj_id = ObjectId(notification_id)
    except Exception:
        return False

    result = await db.notifications.update_one(
        {"_id": notif_obj_id, "user_id": user_id.lower()},
        {"$set": {"read": True}}
    )

    return result.modified_count > 0


# -----------------------------------
# Mark All as Read
# -----------------------------------

async def mark_all_as_read(user_id: str) -> int:
    db = get_db()

    result = await db.notifications.update_many(
        {"user_id": user_id.lower(), "read": False},
        {"$set": {"read": True}}
    )

    return result.modified_count
