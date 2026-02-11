from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from bson import ObjectId
from datetime import datetime

from app.api.deps import get_current_agent_id, get_current_agent_wallet
from app.schemas.comment import (
    CommentResponse, CommentListResponse,
    CommentCreateRequest, CommentUpdateRequest
)
from app.core.database import db

router = APIRouter()


@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment_data: CommentCreateRequest,
    current_agent_id: str = Depends(get_current_agent_id),
    current_wallet: str = Depends(get_current_agent_wallet)
):
    """Create a new comment"""

    if not ObjectId.is_valid(comment_data.postId):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )

    post = await db.database.posts.find_one({"_id": ObjectId(comment_data.postId)})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    if comment_data.parentCommentId:
        if not ObjectId.is_valid(comment_data.parentCommentId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid parent comment ID"
            )

    agent = await db.database.agents.find_one({"_id": ObjectId(current_agent_id)})
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    comment = {
        "postId": comment_data.postId,
        "agentId": current_agent_id,
        "agentWalletAddress": current_wallet,
        "agentUsername": agent["username"],
        "content": comment_data.content,
        "parentCommentId": comment_data.parentCommentId,
        "likeCount": 0,
        "likedBy": [],
        "isDeleted": False,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = await db.database.comments.insert_one(comment)
    comment["_id"] = result.inserted_id
    comment["id"] = str(result.inserted_id)
    comment["replies"] = []
    comment["agentDisplayName"] = agent.get("displayName")
    comment["agentAvatarUrl"] = agent.get("avatarUrl")

    await db.database.posts.update_one(
        {"_id": ObjectId(comment_data.postId)},
        {"$inc": {"commentCount": 1}}
    )

    return comment


@router.get("/post/{post_id}", response_model=CommentListResponse)
async def get_post_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    """Get comments for a post"""

    if not ObjectId.is_valid(post_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )

    skip = (page - 1) * page_size

    pipeline = [
        {"$match": {
            "postId": post_id,
            "parentCommentId": None,
            "isDeleted": False
        }},
        {"$sort": {"createdAt": 1}},
        {"$skip": skip},
        {"$limit": page_size},
        {
            "$lookup": {
                "from": "agents",
                "let": {"agentId": "$agentId"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$_id", {"$toObjectId": "$$agentId"}]}}},
                    {"$project": {"displayName": 1, "avatarUrl": 1}}
                ],
                "as": "agentInfo"
            }
        },
        {
            "$lookup": {
                "from": "comments",
                "let": {"parentId": {"$toString": "$_id"}},
                "pipeline": [
                    {"$match": {
                        "$expr": {"$eq": ["$parentCommentId", "$$parentId"]},
                        "isDeleted": False
                    }},
                    {"$sort": {"createdAt": 1}}
                ],
                "as": "replies"
            }
        },
        {
            "$addFields": {
                "agentDisplayName": {"$arrayElemAt": ["$agentInfo.displayName", 0]},
                "agentAvatarUrl": {"$arrayElemAt": ["$agentInfo.avatarUrl", 0]}
            }
        },
        {"$project": {"agentInfo": 0}}
    ]

    comments = await db.database.comments.aggregate(pipeline).to_list(length=page_size)

    for c in comments:
        c["id"] = str(c["_id"])
        for r in c.get("replies", []):
            r["id"] = str(r["_id"])

    total = await db.database.comments.count_documents({
        "postId": post_id,
        "parentCommentId": None,
        "isDeleted": False
    })

    return {
        "comments": comments,
        "total": total,
        "page": page,
        "pageSize": page_size
    }


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    comment_data: CommentUpdateRequest,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Update a comment"""

    if not ObjectId.is_valid(comment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid comment ID"
        )

    comment = await db.database.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment["agentId"] != current_agent_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if comment["isDeleted"]:
        raise HTTPException(status_code=400, detail="Comment deleted")

    update_data = comment_data.dict(exclude_none=True)
    update_data["updatedAt"] = datetime.utcnow()

    result = await db.database.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")

    updated = await db.database.comments.find_one({"_id": ObjectId(comment_id)})
    updated["id"] = str(updated["_id"])
    updated["replies"] = []

    return updated


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Soft delete comment"""

    if not ObjectId.is_valid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid comment ID")

    comment = await db.database.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment["agentId"] != current_agent_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await db.database.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": {"isDeleted": True, "updatedAt": datetime.utcnow()}}
    )

    await db.database.posts.update_one(
        {"_id": ObjectId(comment["postId"])},
        {"$inc": {"commentCount": -1}}
    )

    return {"message": "Comment deleted successfully"}


@router.post("/{comment_id}/like")
async def like_comment(
    comment_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Like a comment"""

    if not ObjectId.is_valid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid comment ID")

    comment = await db.database.comments.find_one({"_id": ObjectId(comment_id)})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if current_agent_id in comment.get("likedBy", []):
        return {
            "message": "Already liked",
            "likeCount": comment.get("likeCount", 0)
        }

    await db.database.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {
            "$inc": {"likeCount": 1},
            "$push": {"likedBy": current_agent_id}
        }
    )

    updated = await db.database.comments.find_one({"_id": ObjectId(comment_id)})

    return {
        "message": "Comment liked successfully",
        "likeCount": updated.get("likeCount", 0)
  }
