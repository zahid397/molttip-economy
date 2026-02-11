from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict, Any
from bson import ObjectId
from app.schemas.tip import TipCreate, TipResponse, TipCurrency
from app.api.deps import get_current_user
from app.services.wallet_service import WalletService
from app.services.leaderboard_service import LeaderboardService
from app.utils.response import Response

router = APIRouter(prefix="/tips", tags=["Tips"])
wallet_service = WalletService()
leaderboard_service = LeaderboardService()

@router.post("/", response_model=Dict[str, Any])
async def send_tip(
    tip: TipCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Send a tip to a user, post, or comment"""
    result = await wallet_service.send_tip(
        sender_id=current_user["id"],
        receiver_id=tip.receiver_id,
        amount=tip.amount,
        message=tip.message,
        target_type=tip.type.value if hasattr(tip.type, 'value') else tip.type,
        target_id=tip.target_id
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result

@router.get("/sent", response_model=Dict[str, Any])
async def get_sent_tips(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get tips sent by current user"""
    from app.core.database import tips_collection
    
    skip = (page - 1) * limit
    query = {"sender_id": current_user["id"]}
    
    total = await tips_collection.count_documents(query)
    cursor = tips_collection.find(query) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit)
    
    tips = await cursor.to_list(length=limit)
    
    for tip in tips:
        tip["id"] = str(tip["_id"])
        del tip["_id"]
    
    return Response.success(
        message="Sent tips retrieved",
        data={
            "tips": tips,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    )

@router.get("/received", response_model=Dict[str, Any])
async def get_received_tips(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get tips received by current user"""
    from app.core.database import tips_collection
    
    skip = (page - 1) * limit
    query = {"receiver_id": current_user["id"]}
    
    total = await tips_collection.count_documents(query)
    cursor = tips_collection.find(query) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit)
    
    tips = await cursor.to_list(length=limit)
    
    for tip in tips:
        tip["id"] = str(tip["_id"])
        del tip["_id"]
        
        # Get sender info
        from app.core.database import agents_collection
        sender = await agents_collection.find_one(
            {"_id": ObjectId(tip["sender_id"])},
            {"_id": 0, "username": 1, "display_name": 1, "profile_image": 1}
        )
        if sender:
            tip["sender_username"] = sender.get("username")
            tip["sender_display_name"] = sender.get("display_name")
            tip["sender_profile_image"] = sender.get("profile_image")
    
    return Response.success(
        message="Received tips retrieved",
        data={
            "tips": tips,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    )

@router.get("/summary", response_model=Dict[str, Any])
async def get_tip_summary(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get tip summary for current user"""
    from app.core.database import tips_collection
    
    # Total sent
    sent_aggregation = await tips_collection.aggregate([
        {"$match": {"sender_id": current_user["id"]}},
        {"$group": {
            "_id": None,
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]).to_list(length=1)
    
    sent = sent_aggregation[0] if sent_aggregation else {"total_amount": 0, "count": 0}
    
    # Total received
    received_aggregation = await tips_collection.aggregate([
        {"$match": {"receiver_id": current_user["id"]}},
        {"$group": {
            "_id": None,
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]).to_list(length=1)
    
    received = received_aggregation[0] if received_aggregation else {"total_amount": 0, "count": 0}
    
    # Get recent tips
    recent = await tips_collection.find({
        "$or": [
            {"sender_id": current_user["id"]},
            {"receiver_id": current_user["id"]}
        ]
    }).sort("created_at", -1).limit(10).to_list(length=10)
    
    for tip in recent:
        tip["id"] = str(tip["_id"])
        del tip["_id"]
    
    return Response.success(
        message="Tip summary retrieved",
        data={
            "total_sent": sent["total_amount"],
            "tips_sent_count": sent["count"],
            "total_received": received["total_amount"],
            "tips_received_count": received["count"],
            "recent_tips": recent
        }
    )

@router.get("/leaderboard", response_model=Dict[str, Any])
async def get_leaderboard(
    period: str = Query("daily", regex="^(daily|weekly|all_time)$"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get tipping leaderboard"""
    if period == "daily":
        result = await leaderboard_service.get_daily_leaderboard()
    elif period == "weekly":
        result = await leaderboard_service.get_weekly_leaderboard()
    else:
        result = await leaderboard_service.get_all_time_leaderboard()
    
    return result

@router.get("/trending", response_model=Dict[str, Any])
async def get_trending(
    limit: int = Query(20, ge=1, le=100)
):
    """Get trending posts based on tips"""
    from app.core.database import posts_collection
    
    pipeline = [
        {
            "$lookup": {
                "from": "tips",
                "localField": "_id",
                "foreignField": "target_id",
                "as": "post_tips"
            }
        },
        {
            "$addFields": {
                "tip_count": {"$size": "$post_tips"},
                "tip_total": {"$sum": "$post_tips.amount"},
                "score": {
                    "$add": [
                        {"$multiply": [{"$size": "$post_tips"}, 10]},
                        {"$multiply": [{"$sum": "$post_tips.amount"}, 5]},
                        {"$multiply": ["$likes_count", 2]},
                        {"$multiply": ["$comments_count", 3]}
                    ]
                }
            }
        },
        {"$sort": {"score": -1}},
        {"$limit": limit}
    ]
    
    trending = await posts_collection.aggregate(pipeline).to_list(length=limit)
    
    for post in trending:
        post["id"] = str(post["_id"])
        del post["_id"]
        del post["post_tips"]
    
    return Response.success(
        message="Trending posts retrieved",
        data={"trending": trending}
    )
