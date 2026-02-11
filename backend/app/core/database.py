from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


db_client = Database()


async def connect_db():
    try:
        db_client.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_client.db = db_client.client[settings.DATABASE_NAME]

        # Test connection
        await db_client.client.admin.command("ping")
        logger.info("✅ MongoDB connected successfully")

        # Create indexes
        await db_client.db.agents.create_index("wallet_address", unique=True)
        await db_client.db.posts.create_index([("created_at", -1)])
        await db_client.db.tips.create_index([("from_wallet", 1), ("created_at", -1)])
        await db_client.db.tips.create_index([("to_wallet", 1), ("created_at", -1)])
        await db_client.db.notifications.create_index([("user_id", 1), ("read", 1)])

        logger.info("📌 MongoDB indexes ensured")

    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise e


async def close_db():
    if db_client.client:
        db_client.client.close()
        logger.info("🔌 MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    if db_client.db is None:
        raise RuntimeError("Database not connected")
    return db_client.db
