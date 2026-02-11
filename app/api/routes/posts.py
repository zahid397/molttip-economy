from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.api.deps import get_current_user, get_optional_user
from app.core.database import posts_collection, comments_collection, tips_collection, likes_collection
from app.services.notification_service import NotificationService
from app.utils.response import Response

router = APIRouter(prefix="/posts", tags=["Posts"])
notification_service = NotificationService()

@router.post("/", response_model=Dict[str, Any])
async def create_post(
    post: PostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new post"""
    try:
        post_data = {
            "user_id": current_user["id"],
            "username": current_user["username"],
            "display_name": current_user.get("display_name"),
            "profile_image": current_user.get("profile_image"),
            "content": post.content,
            "type": post.type.value if hasattr(post.type, 'value') else post.type,
            "image_urls": post.image_urls or [],
            "video_url": post.video_url,
            "link": post.link,
            "poll_options": post.poll_options or [],
            "poll_votes": {},
            "likes_count": 0,
            "comments_count": 0,
            "tips_count": 0,
            "tips_total": 0.0,
            "retweets_count": 0,
            "is_nsfw": post.is_nsfw,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await posts_collection.insert_one(post_data)
        post_id = str(result.inserted_id)
        
        # Update user's post count
        from app.core.database import agents_collection
        await agents_collection.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$inc": {"posts_count": 1}}
        )
        
        return Response.success(
            message="Post created successfully",
            data={"post_id": post_id, **post_data}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create post"
        )

@router.get("/", response_model=Dict[str, Any])
async def get_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Get posts with pagination"""
    try:
        skip = (page - 1) * limit
        
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        total = await posts_collection.count_documents(query)
        cursor = posts_collection.find(query) \
            .sort("created_at", -1) \
            .skip(skip) \
            .limit(limit)
        
        posts = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string and add interaction status
        for post in posts:
            post["id"] = str(post["_id"])
            del post["_id"]
            
            # Check if current user has liked/retweeted/tipped
            if current_user:
                post["is_liked"] = await likes_collection.find_one({
                    "user_id": current_user["id"],
                    "post_id": post["id"],
                    "type": "post"
                }) is not None
                
                # Check if tipped (simplified)
                tip = await tips_collection.find_one({
                    "sender_id": current_user["id"],
                    "target_id": post["id"],
                    "type": "post"
                })
                post["is_tipped"] = tip is not None
        
        return Response.success(
            message="Posts retrieved",
            data={
                "posts": posts,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get posts"
        )

@router.get("/{post_id}", response_model=Dict[str, Any])
async def get_post(
    post_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Get a specific post"""
    try:
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        post["id"] = str(post["_id"])
        del post["_id"]
        
        # Add interaction status if user is authenticated
        if current_user:
            post["is_liked"] = await likes_collection.find_one({
                "user_id": current_user["id"],
                "post_id": post_id,
                "type": "post"
            }) is not None
        
        return Response.success(
            message="Post retrieved",
            data=post
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get post"
        )

@router.put("/{post_id}", response_model=Dict[str, Any])
async def update_post(
    post_id: str,
    post_update: PostUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update a post"""
    try:
        # Check if post exists and belongs to user
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        if post["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this post"
            )
        
        update_data = post_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        
        return Response.success(message="Post updated successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update post"
        )

@router.delete("/{post_id}", response_model=Dict[str, Any])
async def delete_post(
    post_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a post"""
    try:
        # Check if post exists and belongs to user
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        if post["user_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this post"
            )
        
        # Delete post and related data
        await posts_collection.delete_one({"_id": ObjectId(post_id)})
        await comments_collection.delete_many({"post_id": post_id})
        await likes_collection.delete_many({"post_id": post_id})
        
        # Update user's post count
        from app.core.database import agents_collection
        await agents_collection.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$inc": {"posts_count": -1}}
        )
        
        return Response.success(message="Post deleted successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete post"
        )

@router.post("/{post_id}/like", response_model=Dict[str, Any])
async def like_post(
    post_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Like a post"""
    try:
        # Check if already liked
        existing_like = await likes_collection.find_one({
            "user_id": current_user["id"],
            "post_id": post_id,
            "type": "post"
        })
        
        if existing_like:
            return Response.error("Post already liked")
        
        # Create like
        like = {
            "user_id": current_user["id"],
            "post_id": post_id,
            "type": "post",
            "created_at": datetime.utcnow()
        }
        await likes_collection.insert_one(like)
        
        # Increment post like count
        result = await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"likes_count": 1}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Get post author for notification
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if post and post["user_id"] != current_user["id"]:
            # Send notification
            await notification_service.create_notification(
                user_id=post["user_id"],
                type="post_like",
                title="❤️ New Like",
                message=f"{current_user['display_name'] or current_user['username']} liked your post",
                data={"post_id": post_id},
                related_user_id=current_user["id"],
                related_post_id=post_id
            )
        
        return Response.success(
            message="Post liked",
            data={"likes_count": post.get("likes_count", 0) + 1}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to like post"
        )

@router.delete("/{post_id}/like", response_model=Dict[str, Any])
async def unlike_post(
    post_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Unlike a post"""
    try:
        result = await likes_collection.delete_one({
            "user_id": current_user["id"],
            "post_id": post_id,
            "type": "post"
        })
        
        if result.deleted_count == 0:
            return Response.error("Post not liked")
        
        # Decrement post like count
        await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"likes_count": -1}}
        )
        
        return Response.success(message="Post unliked")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlike post"
        )

@router.get("/{post_id}/likes", response_model=Dict[str, Any])
async def get_post_likes(
    post_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get users who liked a post"""
    try:
        skip = (page - 1) * limit
        
        # Check if post exists
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Get likes
        likes_cursor = likes_collection.find({
            "post_id": post_id,
            "type": "post"
        }).sort("created_at", -1).skip(skip).limit(limit)
        
        likes = await likes_cursor.to_list(length=limit)
        total = await likes_collection.count_documents({
            "post_id": post_id,
            "type": "post"
        })
        
        # Get user details for each like
        from app.core.database import agents_collection
        users = []
        for like in likes:
            user = await agents_collection.find_one(
                {"_id": ObjectId(like["user_id"])},
                {"_id": 1, "username": 1, "display_name": 1, "profile_image": 1}
            )
            if user:
                user["id"] = str(user["_id"])
                del user["_id"]
                users.append(user)
        
        return Response.success(
            message="Likes retrieved",
            data={
                "users": users,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get likes"
        )
