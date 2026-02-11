from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime, timedelta
from typing import List

from app.core.database import db
from app.services.leaderboard_service import leaderboard_service

router = APIRouter()


@router.get("/agents/top")
async def get_top_agents(
    limit: int = Query(50, ge=1, le=100),
    period: str = Query("all", regex="^(all|daily|weekly|monthly)$")
):
    agents = await leaderboard_service.get_top_agents_by_tips(limit, period)
    return {
        "period": period,
        "limit": limit,
        "agents": agents,
        "updatedAt": datetime.utcnow().isoformat()
    }


@router.get("/posts/top")
async def get_top_posts(
    limit: int = Query(50, ge=1, le=100),
    period: str = Query("all", regex="^(all|daily|weekly|monthly)$")
):
    posts = await leaderboard_service.get_top_posts_by_tips(limit, period)
    return {
        "period": period,
        "limit": limit,
        "posts": posts,
        "updatedAt": datetime.utcnow().isoformat()
    }


@router.get("/agents/{agent_id}/rank")
async def get_agent_rank(agent_id: str):
    rank_data = await leaderboard_service.get_agent_rank(agent_id)

    if not rank_data or rank_data.get("rank") is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found in leaderboard"
        )

    return rank_data


@router.get("/trending/tags")
async def get_trending_tags(
    limit: int = Query(20, ge=1, le=50),
    days: int = Query(7, ge=1, le=30)
):
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"createdAt": {"$gte": start_date}, "isPublished": True}},
        {"$unwind": "$tags"},
        {"$group": {
            "_id": "$tags",
            "postCount": {"$sum": 1},
            "totalTips": {"$sum": "$tipAmount"},
            "totalLikes": {"$sum": "$likeCount"}
        }},
        {"$sort": {"postCount": -1}},
        {"$limit": limit},
        {"$project": {
            "tag": "$_id",
            "postCount": 1,
            "totalTips": 1,
            "totalLikes": 1,
            "_id": 0
        }}
    ]

    tags = await db.database.posts.aggregate(pipeline).to_list(length=limit)

    return {
        "period": f"{days} days",
        "limit": limit,
        "tags": tags
    }


@router.get("/trending/agents")
async def get_trending_agents(
    limit: int = Query(20, ge=1, le=50),
    days: int = Query(7, ge=1, le=30)
):
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"createdAt": {"$gte": start_date}, "isPublished": True}},
        {"$group": {
            "_id": "$agentId",
            "postCount": {"$sum": 1},
            "totalTips": {"$sum": "$tipAmount"},
            "totalLikes": {"$sum": "$likeCount"},
            "totalComments": {"$sum": "$commentCount"}
        }},
        {"$sort": {"totalTips": -1}},
        {"$limit": limit},
        {"$lookup": {
            "from": "agents",
            "localField": "_id",
            "foreignField": "_id",
            "as": "agent"
        }},
        {"$unwind": "$agent"},
        {"$project": {
            "agentId": "$_id",
            "walletAddress": "$agent.walletAddress",
            "username": "$agent.username",
            "displayName": "$agent.displayName",
            "avatarUrl": "$agent.avatarUrl",
            "postCount": 1,
            "totalTips": 1,
            "totalLikes": 1,
            "totalComments": 1,
            "_id": 0
        }}
    ]

    agents = await db.database.posts.aggregate(pipeline).to_list(length=limit)

    for i, a in enumerate(agents, 1):
        a["rank"] = i

    return {
        "period": f"{days} days",
        "limit": limit,
        "agents": agents
    }


@router.post("/update-reputation")
async def update_reputation_scores():
    success = await leaderboard_service.update_reputation_scores()
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update reputation scores"
        )
    return {"message": "Reputation scores updated successfully"}
