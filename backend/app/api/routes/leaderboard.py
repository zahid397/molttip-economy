from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.services.leaderboard_service import (
    get_top_earners,
    get_top_tippers,
    get_trending_agents,
)

router = APIRouter()


@router.get("/earners")
async def top_earners(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    earners = await get_top_earners(limit)
    return {"success": True, "message": "Top earners fetched", "data": earners}


@router.get("/tippers")
async def top_tippers(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    tippers = await get_top_tippers(limit)
    return {"success": True, "message": "Top tippers fetched", "data": tippers}


@router.get("/trending")
async def trending_agents(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    trending = await get_trending_agents(limit)
    return {"success": True, "message": "Trending agents fetched", "data": trending}
