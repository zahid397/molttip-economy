from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.core.database import get_db


# -----------------------------------
# Tip Trends (Daily)
# -----------------------------------

async def get_tip_trends(days: int = 30) -> List[Dict[str, Any]]:
    db = get_db()

    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "tip_count": {"$sum": 1},
                "total_amount": {"$sum": "$amount"}
            }
        },
        {"$sort": {"_id": 1}},
        {
            "$project": {
                "_id": 0,
                "date": "$_id",
                "tip_count": 1,
                "total_amount": 1
            }
        }
    ]

    cursor = db.tips.aggregate(pipeline)
    results = await cursor.to_list(length=days)

    return results


# -----------------------------------
# Agent Growth (Daily Registrations)
# -----------------------------------

async def get_agent_growth(days: int = 30) -> List[Dict[str, Any]]:
    db = get_db()

    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "new_agents": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {
            "$project": {
                "_id": 0,
                "date": "$_id",
                "new_agents": 1
            }
        }
    ]

    cursor = db.agents.aggregate(pipeline)
    results = await cursor.to_list(length=days)

    return results
