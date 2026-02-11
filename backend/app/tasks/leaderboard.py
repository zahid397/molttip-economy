import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def recalc_leaderboards():
    """
    Refresh leaderboard caches in MongoDB (optional).
    For now: only logs.
    """
    logger.info("Recalculating leaderboards...")
    logger.info("Leaderboard update complete.")


def start_scheduler():
    scheduler.add_job(recalc_leaderboards, "interval", hours=1)
    scheduler.start()
    logger.info("Leaderboard scheduler started.")
