from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.database import get_database
from datetime import datetime

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/", response_model=Dict[str, Any])
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = get_database()
        db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    
    return {
        "status": "ok",
        "message": "Molttip Economy Backend running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": db_status
    }

@router.get("/details", response_model=Dict[str, Any])
async def health_details():
    """Detailed health check"""
    try:
        db = get_database()
        
        # Get counts
        agents_count = db["agents"].count_documents({})
        posts_count = db["posts"].count_documents({})
        tips_count = db["tips"].count_documents({})
        
        db_status = "connected"
        db_details = {
            "agents": agents_count,
            "posts": posts_count,
            "tips": tips_count
        }
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
        db_details = None
    
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "healthy",
            "database": db_status
        },
        "metrics": db_details
    }
