from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger("database")


class Database:
    client: AsyncIOMotorClient | None = None
    database = None


db = Database()


async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=20,
            minPoolSize=5,
            serverSelectionTimeoutMS=5000,
        )

        db.database = db.client[settings.DATABASE_NAME]

        # Test connection
        await db.client.admin.command("ping")

        logger.info("✅ Connected to MongoDB")

        await create_indexes()

    except Exception as e:
        logger.exception("❌ MongoDB connection failed")
        raise e


async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("🔌 MongoDB connection closed")


async def create_indexes():
    try:
        # Agents
        await db.database.agents.create_index(
            "walletAddress", unique=True, background=True
        )
        await db.database.agents.create_index(
            "reputationScore", background=True
        )
        await db.database.agents.create_index(
            "created_at", background=True
        )

        # Posts
        await db.database.posts.create_index(
            "agentId", background=True
        )
        await db.database.posts.create_index(
            [("created_at", -1)], background=True
        )
        await db.database.posts.create_index(
            [("tipAmount", -1)], background=True
        )

        # Tips
        await db.database.tips.create_index(
            "txHash", unique=True, background=True
        )
        await db.database.tips.create_index(
            "fromAddress", background=True
        )
        await db.database.tips.create_index(
            "toAddress", background=True
        )
        await db.database.tips.create_index(
            [("created_at", -1)], background=True
        )

        # Transactions
        await db.database.transactions.create_index(
            "txHash", unique=True, background=True
        )

        # Notifications
        await db.database.notifications.create_index(
            "userId", background=True
        )
        await db.database.notifications.create_index(
            [("userId", 1), ("read", 1)], background=True
        )
        await db.database.notifications.create_index(
            [("created_at", -1)], background=True
        )

        logger.info("📦 MongoDB indexes ensured")

    except Exception as e:
        logger.exception("⚠️ Index creation issue (safe to ignore on rerun)")


def get_database():
    if not db.database:
        raise RuntimeError("Database not initialized")
    return db.database
