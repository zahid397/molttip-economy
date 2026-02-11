import asyncio
import logging
from datetime import datetime, timedelta

from app.core.database import db
from app.services.leaderboard_service import leaderboard_service

logger = logging.getLogger(__name__)


async def update_leaderboard_task():
    """Update reputation scores safely"""
    try:
        logger.info("Starting leaderboard update...")

        success = await leaderboard_service.update_reputation_scores()

        if success:
            logger.info("Leaderboard updated successfully")
        else:
            logger.error("Leaderboard update failed")

        return success

    except Exception as e:
        logger.exception("Leaderboard update crashed")
        return False


async def update_daily_leaderboard():
    """Create daily snapshot (with duplicate protection)"""
    try:
        today = datetime.utcnow().date().isoformat()

        # Prevent duplicate snapshot
        existing = await db.database.leaderboard_snapshots.find_one({
            "date": today,
            "type": "daily"
        })

        if existing:
            logger.info("Daily snapshot already exists")
            return True

        top_agents = await leaderboard_service.get_top_agents_by_tips(
            limit=100,
            period="daily"
        )

        snapshot = {
            "date": today,
            "type": "daily",
            "data": {
                "top_agents": top_agents,
                "timestamp": datetime.utcnow().isoformat()
            },
            "createdAt": datetime.utcnow()
        }

        await db.database.leaderboard_snapshots.insert_one(snapshot)

        logger.info(f"Daily leaderboard snapshot saved for {today}")
        return True

    except Exception:
        logger.exception("Daily leaderboard snapshot failed")
        return False


async def cleanup_old_snapshots(days_to_keep: int = 30):
    """Delete old snapshots"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

        result = await db.database.leaderboard_snapshots.delete_many({
            "createdAt": {"$lt": cutoff_date}
        })

        logger.info(f"Deleted {result.deleted_count} old snapshots")
        return result.deleted_count

    except Exception:
        logger.exception("Snapshot cleanup failed")
        return 0
