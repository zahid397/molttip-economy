from fastapi import APIRouter
from app.services.analytics_service import get_tip_trends, get_agent_growth

router = APIRouter()


@router.get("/tips")
async def tip_analytics():
    trends = await get_tip_trends()
    return {
        "success": True,
        "message": "Tip analytics fetched",
        "data": trends
    }


@router.get("/agents")
async def agent_growth_analytics():
    growth = await get_agent_growth()
    return {
        "success": True,
        "message": "Agent growth analytics fetched",
        "data": growth
    }
