from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Async MongoDB client
async_client: AsyncIOMotorClient = None
# Sync MongoDB client (for tasks that don't need async)
sync_client: MongoClient = None

def get_database():
    """Get sync MongoDB database"""
    global sync_client
    if sync_client is None:
        sync_client = MongoClient(settings.MONGO_URL)
    return sync_client[settings.MONGO_DB_NAME]

async def get_async_database():
    """Get async MongoDB database"""
    global async_client
    if async_client is None:
        async_client = AsyncIOMotorClient(settings.MONGO_URL)
    return async_client[settings.MONGO_DB_NAME]

# Collections
def get_collection(collection_name: str):
    db = get_database()
    return db[collection_name]

async def get_async_collection(collection_name: str):
    db = await get_async_database()
    return db[collection_name]

# Initialize collections
agents_collection = get_collection("agents")
posts_collection = get_collection("posts")
comments_collection = get_collection("comments")
tips_collection = get_collection("tips")
notifications_collection = get_collection("notifications")
transactions_collection = get_collection("transactions")
likes_collection = get_collection("likes")
follows_collection = get_collection("follows")
leaderboard_collection = get_collection("leaderboard")
