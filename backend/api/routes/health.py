from fastapi import APIRouter
from datetime import datetime
import logging

from app.core.database import db
from app.services.blockchain_service import blockchain_service
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "MoltTip Economy API",
        "version": settings.APP_VERSION if hasattr(settings, "APP_VERSION") else "1.0.0"
    }

    # MongoDB check
    try:
        if not db.database:
            raise Exception("Database not initialized")

        await db.database.command("ping")
        health_status["mongodb"] = "connected"
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")
        health_status["mongodb"] = "disconnected"
        health_status["status"] = "degraded"

    # Blockchain check
    try:
        latest_block = blockchain_service.web3.eth.block_number
        health_status["blockchain"] = {
            "status": "connected",
            "network": "Base Sepolia",
            "latest_block": latest_block,
            "chain_id": settings.CHAIN_ID
        }
    except Exception as e:
        logger.error(f"Blockchain health check failed: {e}")
        health_status["blockchain"] = {
            "status": "disconnected",
            "error": str(e)
        }
        health_status["status"] = "degraded"

    # Groq check (optional feature)
    health_status["groq_ai"] = "configured" if settings.GROQ_API_KEY else "not_configured"

    # System info (optional)
    try:
        import psutil
        health_status["system"] = {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage("/").percent
        }
    except Exception as e:
        health_status["system"] = {"error": "psutil not installed"}

    return health_status


@router.get("/database/stats")
async def database_stats():
    """Get database statistics"""
    try:
        if not db.database:
            raise Exception("Database not initialized")

        stats = {
            "agents": await db.database.agents.count_documents({}),
            "posts": await db.database.posts.count_documents({}),
            "tips": await db.database.tips.count_documents({}),
            "comments": await db.database.comments.count_documents({}),
            "notifications": await db.database.notifications.count_documents({}),
            "timestamp": datetime.utcnow().isoformat()
        }

        tip_status = await db.database.tips.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]).to_list(length=10)

        stats["tip_status"] = {item["_id"]: item["count"] for item in tip_status}

        return stats

    except Exception as e:
        logger.error(f"Database stats error: {e}")
        return {"error": str(e)}


@router.get("/blockchain/status")
async def blockchain_status():
    """Get blockchain status"""
    try:
        web3 = blockchain_service.web3

        status = {
            "connected": web3.is_connected(),
            "network": "Base Sepolia",
            "chain_id": web3.eth.chain_id,
            "latest_block": web3.eth.block_number,
            "gas_price": str(web3.eth.gas_price),
            "timestamp": datetime.utcnow().isoformat()
        }

        return status

    except Exception as e:
        logger.error(f"Blockchain status error: {e}")
        return {
            "connected": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
