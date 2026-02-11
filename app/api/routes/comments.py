from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.api.deps import get_current_user, get_optional_user
from app.core.database import comments_collection, posts_collection, likes_collection
from app.services.notification_service import NotificationService
from app.utils.response import Response

router = APIRouter(prefix="/comments", tags=["Comments"])
notification_service = NotificationService()

@router.post("/", response_model=Dict[str, Any])
async def create_comment(
    comment: CommentCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new comment"""
    try:
        # Check if post exists
        post = await posts_collection.find_one({"_id": ObjectId(comment.post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        comment_data = {
            "post_id": comment.post_id,
            "user_id": current_user["id"],
            "username": current_user["username"],
            "display_name": current_user.get("display_name"),
            "profile_image": current_user.get("profile_image"),
            "content": comment.content,
            "parent_comment_id": comment.parent_comment_id,
            "likes_count": 0,
            "tips_count": 0,
            "tips_total": 0.0,
            "replies_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await comments_collection.insert_one(comment_data)
        comment_id = str(result.inserted_id)
        
        # Update post comment count
        await posts_collection.update_one(
            {"_id": ObjectId(comment.post_id)},
            {"$inc": {"comments_count": 1}}
        )
        
        # If replying to a comment, update reply count
        if comment.parent_comment_id:
            await comments_collection.update_one(
                {"_id": ObjectId(comment.parent_comment_id)},
                {"$inc": {"replies_count": 1}}
            )
            
            # Send notification to original comment author
            parent_comment = await comments_collection.find_one(
                {"_id": ObjectId(comment.parent_comment_id)}
            )
            if parent_comment and parent_comment["user_id"] != current_user["id"]:
                await notification_service.create_notification(
                    user_id=parent_comment["user_id"],
                    type="comment_reply",
                    title="💬 New Reply",
                    message=f"{current_user['display_name'] or current_user['username']} replied to your comment",
                    data={"comment_id": comment_id, "post_id": comment.post_id},
                    related_user_id=current_user["id"],
                    related_comment_id=comment_id
                )
        else:
            # Send notification to post author
            if post["user_id"] != current_user["id"]:
                await notification_service.create_notification(
                    user_id=post["user_id"],
                    type="new_comment",
                    title="💬 New Comment",
                    message=f"{current_user['display_name'] or current_user['username']} commented on your post",
                    data={"comment_id": comment_id, "post_id": comment.post_id},
                    related_user_id=current_user["id"],
                    related_comment_id=comment_id
                )
        
        return Response.success(
            message="Comment created successfully",
            data={"comment_id": comment_id, **comment_data}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create comment"
        )

@router.get("/post/{post_id}", response_model=Dict[str, Any])
async def get_post_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Get comments for a post"""
    try:
        skip = (page - 1) * limit
        
        # Check if post exists
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Get top-level comments
        query = {"post_id": post_id, "parent_comment_id": None}
        total = await comments_collection.count_documents(query)
        
        cursor = comments_collection.find(query) \
            .sort("created_at", -1) \
            .skip(skip) \
            .limit(limit)
        
        comments = await cursor.to_list(length=limit)
        
        # Process comments and their replies
        result_comments = []
        for comment in comments:
            comment["id"] = str(comment["_id"])
            del comment["_id"]
            
            # Check if liked by current user
            if current_user:
                comment["is_liked"] = await likes_collection.find_one({
                    "user_id": current_user["id"],
                    "comment_id": comment["id"],
                    "type": "comment"
                }) is not None
            
            # Get replies for this comment
            replies = await get_comment_replies(comment["id"], current_user)
            comment["replies"] = replies
            comment["replies_count"] = len(replies)
            
            result_comments.append(comment)
        
        return Response.success(
            message="Comments retrieved",
            data={
                "comments": result_comments,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get comments"
        )

async def get_comment_replies(comment_id: str, current_user: Optional[Dict] = None) -> List[Dict]:
    """Get replies for a comment"""
    replies_cursor = comments_collection.find({
        "parent_comment_id": comment_id
    }).sort("created_at", 1)
    
    replies = await replies_cursor.to_list(length=50)
    
    for reply in replies:
        reply["id"] = str(reply["_id"])
        del reply["_id"]
        
        if current_user:
            reply["is_liked"] = await likes_collection.find_one({
                "user_id": current_user["id"],
                "comment_id": reply["id"],
                "type": "comment"
            }) is not None
    
    return replies

@router.put("/{comment_id}", response_model=Dict[str, Any])
async def update_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Update a comment"""
    try:
        comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        if comment["user_id"] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this comment"
            )
        
        await comments_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {
                "$set": {
                    "content": comment_update.content,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return Response.success(message="Comment updated successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update comment"
        )

@router.delete("/{comment_id}", response_model=Dict[str, Any])
async def delete_comment(
    comment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a comment"""
    try:
        comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        if comment["user_id"] != current_user["id"] and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this comment"
            )
        
        # Delete comment and its replies
        await comments_collection.delete_many({
            "$or": [
                {"_id": ObjectId(comment_id)},
                {"parent_comment_id": comment_id}
            ]
        })
        
        # Update post comment count
        reply_count = comment.get("replies_count", 0) + 1
        await posts_collection.update_one(
            {"_id": ObjectId(comment["post_id"])},
            {"$inc": {"comments_count": -reply_count}}
        )
        
        return Response.success(message="Comment deleted successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete comment"
        )

@router.post("/{comment_id}/like", response_model=Dict[str, Any])
async def like_comment(
    comment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Like a comment"""
    try:
        existing_like = await likes_collection.find_one({
            "user_id": current_user["id"],
            "comment_id": comment_id,
            "type": "comment"
        })
        
        if existing_like:
            return Response.error("Comment already liked")
        
        like = {
            "user_id": current_user["id"],
            "comment_id": comment_id,
            "type": "comment",
            "created_at": datetime.utcnow()
        }
        await likes_collection.insert_one(like)
        
        result = await comments_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {"$inc": {"likes_count": 1}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Get comment for notification
        comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
        if comment and comment["user_id"] != current_user["id"]:
            await notification_service.create_notification(
                user_id=comment["user_id"],
                type="comment_like",
                title="❤️ New Like",
                message=f"{current_user['display_name'] or current_user['username']} liked your comment",
                data={"comment_id": comment_id},
                related_user_id=current_user["id"],
                related_comment_id=comment_id
            )
        
        return Response.success(message="Comment liked")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to like comment"
        )

@router.delete("/{comment_id}/like", response_model=Dict[str, Any])
async def unlike_comment(
    comment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Unlike a comment"""
    try:
        result = await likes_collection.delete_one({
            "user_id": current_user["id"],
            "comment_id": comment_id,
            "type": "comment"
        })
        
        if result.deleted_count == 0:
            return Response.error("Comment not liked")
        
        await comments_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {"$inc": {"likes_count": -1}}
        )
        
        return Response.success(message="Comment unliked")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlike comment"
        )
