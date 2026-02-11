from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.api.deps import get_current_user, get_current_admin_user
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])
analytics_service = AnalyticsService()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_stats(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Get dashboard statistics (admin only)"""
    result = await analytics_service.get_dashboard_stats()
    return result

@router.get("/user/{user_id}", response_model=Dict[str, Any])
async def get_user_analytics(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user analytics (own data or admin)"""
    # Only allow users to see their own analytics unless admin
    if user_id != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's analytics"
        )
    
    result = await analytics_service.get_user_analytics(user_id)
    return result

@router.get("/trending", response_model=Dict[str, Any])
async def get_trending_analytics(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Get trending analytics (admin only)"""
    from app.core.database import tips_collection, posts_collection, comments_collection
    
    # Get trending hashtags (simplified)
    pipeline = [
        {"$unwind": {"path": "$content", "preserveNullAndEmptyArrays": False}},
        {"$match": {"content": {"$regex": "#[a-zA-Z0-9_]+"}}},
        {"$group": {"_id": "$content", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20}
    ]
    
    hashtags = await posts_collection.aggregate(pipeline).to_list(length=20)
    
    # Get active hours
    hours_pipeline = [
        {
            "$group": {
                "_id": {"$hour": "$created_at"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    active_hours = await posts_collection.aggregate(hours_pipeline).to_list(length=24)
    
    return {
        "success": True,
        "data": {
            "trending_hashtags": hashtags,
            "active_hours": active_hours
        }
    }
