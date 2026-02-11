from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.core.database import get_db


# -----------------------------------
# Top Earners
# -----------------------------------

async def get_top_earners(limit: int = 10) -> List[Dict[str, Any]]:
    db = get_db()

    cursor = (
        db.agents
        .find({}, {"_id": 0})  # exclude internal id if needed
        .sort("stats.total_tip_amount_received", -1)
        .limit(limit)
    )

    return await cursor.to_list(length=limit)


# -----------------------------------
# Top Tippers
# -----------------------------------

async def get_top_tippers(limit: int = 10) -> List[Dict[str, Any]]:
    db = get_db()

    cursor = (
        db.agents
        .find({}, {"_id": 0})
        .sort("stats.total_tip_amount_given", -1)
        .limit(limit)
    )

    return await cursor.to_list(length=limit)


# -----------------------------------
# Trending Agents (Last 7 Days)
# -----------------------------------

async def get_trending_agents(limit: int = 10) -> List[Dict[str, Any]]:
    db = get_db()

    week_ago = datetime.utcnow() - timedelta(days=7)

    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": week_ago},
                "verified": True
            }
        },
        {
            "$group": {
                "_id": "$to_wallet",
                "tip_count": {"$sum": 1},
                "total_amount": {"$sum": "$amount"}
            }
        },
        {
            "$sort": {
                "tip_count": -1,
                "total_amount": -1
            }
        },
        {"$limit": limit},
        {
            "$lookup": {
                "from": "agents",
                "localField": "_id",
                "foreignField": "wallet_address",
                "as": "agent"
            }
        },
        {"$unwind": "$agent"},
        {
            "$project": {
                "_id": 0,
                "wallet_address": "$agent.wallet_address",
                "username": "$agent.username",
                "display_name": "$agent.display_name",
                "avatar_url": "$agent.avatar_url",
                "tip_count": 1,
                "total_amount": 1
            }
        }
    ]

    cursor = db.tips.aggregate(pipeline)

    return await cursor.to_list(length=limit)
