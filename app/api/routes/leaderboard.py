from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.leaderboard_service import leaderboard_service
from app.schemas.response import success_response


router = APIRouter()


@router.get("/earners")
async def get_top_earners(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    earners = leaderboard_service.get_top_earners(db, limit)
    return success_response(earners)


@router.get("/givers")
async def get_top_givers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    givers = leaderboard_service.get_top_givers(db, limit)
    return success_response(givers)
