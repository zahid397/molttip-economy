from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/overall")
async def get_overall_analytics():
    stats = await analytics_service.get_overall_stats()
    if not stats["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=stats.get("error", "Failed to get analytics")
        )
    return stats


@router.get("/daily")
async def get_daily_analytics(days: int = Query(30, ge=1, le=365)):
    daily_stats = await analytics_service.get_daily_stats(days)
    if "error" in daily_stats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=daily_stats["error"]
        )
    return daily_stats


@router.get("/agents/{agent_id}")
async def get_agent_analytics(agent_id: str):
    analytics = await analytics_service.get_agent_analytics(agent_id)
    if not analytics["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=analytics.get("error", "Agent not found")
        )
    return analytics


@router.get("/volume/total")
async def get_total_volume():
    try:
        from app.core.database import db

        result = await db.database.tips.aggregate([
            {"$match": {"status": "confirmed"}},
            {"$group": {
                "_id": None,
                "totalVolume": {"$sum": "$amount"},
                "totalTransactions": {"$sum": 1},
                "averageAmount": {"$avg": "$amount"}
            }}
        ]).to_list(length=1)

        return result[0] if result else {
            "totalVolume": 0,
            "totalTransactions": 0,
            "averageAmount": 0
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/activity/recent")
async def get_recent_activity(limit: int = Query(50, ge=1, le=100)):
    try:
        from app.core.database import db
        from bson import ObjectId

        recent_tips = await db.database.tips.find(
            {"status": "confirmed"}
        ).sort("createdAt", -1).limit(limit).to_list(length=limit)

        recent_posts = await db.database.posts.find(
            {"isPublished": True}
        ).sort("createdAt", -1).limit(limit).to_list(length=limit)

        # Collect all wallet addresses & agentIds
        wallet_addresses = set()
        agent_ids = set()

        for tip in recent_tips:
            wallet_addresses.add(tip["fromAddress"])
            wallet_addresses.add(tip["toAddress"])

        for post in recent_posts:
            agent_ids.add(post["agentId"])

        agents_by_wallet = {
            agent["walletAddress"]: agent
            for agent in await db.database.agents.find(
                {"walletAddress": {"$in": list(wallet_addresses)}}
            ).to_list(length=None)
        }

        agents_by_id = {
            str(agent["_id"]): agent
            for agent in await db.database.agents.find(
                {"_id": {"$in": [ObjectId(a) for a in agent_ids]}}
            ).to_list(length=None)
        }

        formatted_tips = []
        for tip in recent_tips:
            tip["id"] = str(tip["_id"])
            tip["fromUsername"] = agents_by_wallet.get(
                tip["fromAddress"], {}
            ).get("username")
            tip["toUsername"] = agents_by_wallet.get(
                tip["toAddress"], {}
            ).get("username")
            tip["type"] = "tip"
            formatted_tips.append(tip)

        formatted_posts = []
        for post in recent_posts:
            post["id"] = str(post["_id"])
            agent = agents_by_id.get(post["agentId"], {})
            post["agentUsername"] = agent.get("username")
            post["agentDisplayName"] = agent.get("displayName")
            post["type"] = "post"
            formatted_posts.append(post)

        all_activity = formatted_tips + formatted_posts
        all_activity.sort(
            key=lambda x: x.get("createdAt", datetime.min),
            reverse=True
        )

        return {
            "activity": all_activity[:limit],
            "tipCount": len(formatted_tips),
            "postCount": len(formatted_posts),
            "total": len(all_activity)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
