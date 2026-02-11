from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
async def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": "Molttip Economy API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
