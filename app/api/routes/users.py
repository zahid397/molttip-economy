from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, Optional
from bson import ObjectId
from datetime import datetime
from app.api.deps import get_current_user
from app.schemas.agent import AgentUpdate, AgentPublicProfile
from app.core.database import agents_collection, posts_collection, follows_collection
from app.utils.response import Response

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile/{user_id}", response_model=Dict[str, Any])
async def get_user_profile(
    user_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """Get user profile by ID"""
    user = await agents_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if current user is following this user
    is_following = False
    if current_user:
        follow = await follows_collection.find_one({
            "follower_id": current_user["id"],
            "following_id": user_id
        })
        is_following = follow is not None
    
    # Format response
    profile = {
        "id": str(user["_id"]),
        "username": user["username"],
        "display_name": user.get("display_name"),
        "bio": user.get("bio"),
        "profile_image": user.get("profile_image"),
        "wallet_address": user.get("wallet_address"),
        "wallet_balance": user.get("wallet_balance", 0),
        "total_tips_received": user.get("total_tips_received", 0),
        "total_tips_sent": user.get("total_tips_sent", 0),
        "followers_count": user.get("followers_count", 0),
        "following_count": user.get("following_count", 0),
        "posts_count": user.get("posts_count", 0),
        "is_verified": user.get("is_verified", False),
        "is_following": is_following,
        "created_at": user.get("created_at")
    }
    
    return Response.success(
        message="User profile retrieved",
        data=profile
    )

@router.put("/profile", response_model=Dict[str, Any])
async def update_profile(
    profile_update: AgentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update current user's profile"""
    update_data = profile_update.dict(exclude_unset=True)
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        await agents_collection.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_data}
        )
    
    return Response.success(message="Profile updated successfully")

@router.post("/{user_id}/follow", response_model=Dict[str, Any])
async def follow_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Follow a user"""
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    # Check if user exists
    target_user = await agents_collection.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already following
    existing_follow = await follows_collection.find_one({
        "follower_id": current_user["id"],
        "following_id": user_id
    })
    
    if existing_follow:
        return Response.error("Already following this user")
    
    # Create follow relationship
    follow = {
        "follower_id": current_user["id"],
        "following_id": user_id,
        "created_at": datetime.utcnow()
    }
    await follows_collection.insert_one(follow)
    
    # Update counts
    await agents_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$inc": {"following_count": 1}}
    )
    
    await agents_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"followers_count": 1}}
    )
    
    # Send notification
    from app.services.notification_service import NotificationService
    notification_service = NotificationService()
    await notification_service.create_notification(
        user_id=user_id,
        type="new_follower",
        title="👥 New Follower",
        message=f"{current_user['display_name'] or current_user['username']} started following you",
        data={"follower_id": current_user["id"]},
        related_user_id=current_user["id"]
    )
    
    return Response.success(message="User followed successfully")

@router.delete("/{user_id}/follow", response_model=Dict[str, Any])
async def unfollow_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Unfollow a user"""
    result = await follows_collection.delete_one({
        "follower_id": current_user["id"],
        "following_id": user_id
    })
    
    if result.deleted_count == 0:
        return Response.error("Not following this user")
    
    # Update counts
    await agents_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$inc": {"following_count": -1}}
    )
    
    await agents_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"followers_count": -1}}
    )
    
    return Response.success(message="User unfollowed successfully")

@router.get("/{user_id}/followers", response_model=Dict[str, Any])
async def get_followers(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get user's followers"""
    skip = (page - 1) * limit
    
    # Check if user exists
    user = await agents_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get followers
    followers_cursor = follows_collection.find({
        "following_id": user_id
    }).skip(skip).limit(limit)
    
    followers = await followers_cursor.to_list(length=limit)
    total = await follows_collection.count_documents({"following_id": user_id})
    
    # Get follower details
    follower_users = []
    for follow in followers:
        follower = await agents_collection.find_one(
            {"_id": ObjectId(follow["follower_id"])},
            {"_id": 1, "username": 1, "display_name": 1, "profile_image": 1}
        )
        if follower:
            follower["id"] = str(follower["_id"])
            del follower["_id"]
            follower_users.append(follower)
    
    return Response.success(
        message="Followers retrieved",
        data={
            "followers": follower_users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    )

@router.get("/{user_id}/following", response_model=Dict[str, Any])
async def get_following(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get users that a user is following"""
    skip = (page - 1) * limit
    
    # Check if user exists
    user = await agents_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get following
    following_cursor = follows_collection.find({
        "follower_id": user_id
    }).skip(skip).limit(limit)
    
    following = await following_cursor.to_list(length=limit)
    total = await follows_collection.count_documents({"follower_id": user_id})
    
    # Get following details
    following_users = []
    for follow in following:
        followed = await agents_collection.find_one(
            {"_id": ObjectId(follow["following_id"])},
            {"_id": 1, "username": 1, "display_name": 1, "profile_image": 1}
        )
        if followed:
            followed["id"] = str(followed["_id"])
            del followed["_id"]
            following_users.append(followed)
    
    return Response.success(
        message="Following retrieved",
        data={
            "following": following_users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    )
