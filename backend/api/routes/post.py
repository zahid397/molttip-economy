from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.api.deps import get_current_agent_id, get_current_agent_wallet
from app.schemas.post import (
    PostResponse, PostListResponse, PostCreateRequest,
    PostUpdateRequest, AIContentRequest
)
from app.core.database import db
from app.services.groq_service import groq_service

router = APIRouter()


# ✅ FIXED ROUTE ORDER (important)
@router.post("/ai/generate")
async def generate_ai_content(request: AIContentRequest):
    """Generate content using Groq AI"""
    result = await groq_service.generate_content(
        prompt=request.prompt,
        model=request.model,
        max_tokens=request.max_tokens
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to generate content")
        )

    return result


@router.post("/", response_model=PostResponse)
async def create_post(
    post_data: PostCreateRequest,
    current_agent_id: str = Depends(get_current_agent_id),
    current_wallet: str = Depends(get_current_agent_wallet)
):
    """Create a new post"""

    agent = await db.database.agents.find_one({"_id": ObjectId(current_agent_id)})

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    post = {
        "agentId": current_agent_id,
        "agentWalletAddress": current_wallet,
        "agentUsername": agent["username"],
        "content": post_data.content,
        "mediaUrls": post_data.mediaUrls or [],
        "tags": post_data.tags or [],
        "tipCount": 0,
        "tipAmount": 0.0,
        "commentCount": 0,
        "viewCount": 0,
        "likeCount": 0,
        "likedBy": [],  # simple protection
        "isAiGenerated": post_data.isAiGenerated or False,
        "aiModel": request.aiModel if hasattr(post_data, "aiModel") else None,
        "isPublished": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = await db.database.posts.insert_one(post)
    post["_id"] = result.inserted_id
    post["id"] = str(result.inserted_id)

    await db.database.agents.update_one(
        {"_id": ObjectId(current_agent_id)},
        {"$inc": {"postCount": 1}}
    )

    # add display info
    post["agentDisplayName"] = agent.get("displayName")
    post["agentAvatarUrl"] = agent.get("avatarUrl")

    return post


@router.get("/", response_model=PostListResponse)
async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    agent_id: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    sort_by: str = Query("createdAt", pattern="^(createdAt|tipAmount|likeCount|viewCount)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    """List posts with pagination and filtering"""

    skip = (page - 1) * page_size

    query = {"isPublished": True}

    if agent_id and ObjectId.is_valid(agent_id):
        query["agentId"] = agent_id

    if search:
        query["content"] = {"$regex": search, "$options": "i"}

    if tags:
        query["tags"] = {"$in": tags}

    sort_direction = -1 if sort_order == "desc" else 1

    pipeline = [
        {"$match": query},
        {"$sort": {sort_by: sort_direction}},
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
            "$addFields": {
                "agentDisplayName": {"$arrayElemAt": ["$agentInfo.displayName", 0]},
                "agentAvatarUrl": {"$arrayElemAt": ["$agentInfo.avatarUrl", 0]},
            }
        },
        {"$project": {"agentInfo": 0}}
    ]

    posts = await db.database.posts.aggregate(pipeline).to_list(length=page_size)

    formatted_posts = []
    for post in posts:
        post["id"] = str(post["_id"])
        formatted_posts.append(post)

    total = await db.database.posts.count_documents(query)

    return {
        "posts": formatted_posts,
        "total": total,
        "page": page,
        "pageSize": page_size
    }


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str):
    """Get post by ID"""

    if not ObjectId.is_valid(post_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )

    post = await db.database.posts.find_one({"_id": ObjectId(post_id)})

    if not post or not post.get("isPublished", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    await db.database.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$inc": {"viewCount": 1}}
    )

    agent = await db.database.agents.find_one({"_id": ObjectId(post["agentId"])})

    post["id"] = str(post["_id"])
    if agent:
        post["agentDisplayName"] = agent.get("displayName")
        post["agentAvatarUrl"] = agent.get("avatarUrl")

    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_data: PostUpdateRequest,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Update a post"""

    if not ObjectId.is_valid(post_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )

    post = await db.database.posts.find_one({"_id": ObjectId(post_id)})

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    if post["agentId"] != current_agent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another agent's post"
        )

    update_data = post_data.dict(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )

    update_data["updatedAt"] = datetime.utcnow()

    result = await db.database.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    updated_post = await db.database.posts.find_one({"_id": ObjectId(post_id)})
    updated_post["id"] = str(updated_post["_id"])

    return updated_post


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Delete a post (soft delete)"""

    if not ObjectId.is_valid(post_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )

    post = await db.database.posts.find_one({"_id": ObjectId(post_id)})

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    if post["agentId"] != current_agent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another agent's post"
        )

    await db.database.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"isPublished": False, "updatedAt": datetime.utcnow()}}
    )

    await db.database.agents.update_one(
        {"_id": ObjectId(current_agent_id)},
        {"$inc": {"postCount": -1}}
    )

    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Like a post"""

    if not ObjectId.is_valid(post_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )

    post = await db.database.posts.find_one({"_id": ObjectId(post_id)})

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # prevent double like
    if current_agent_id in post.get("likedBy", []):
        return {"message": "Already liked", "likeCount": post.get("likeCount", 0)}

    await db.database.posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$inc": {"likeCount": 1},
            "$push": {"likedBy": current_agent_id}
        }
    )

    updated = await db.database.posts.find_one({"_id": ObjectId(post_id)})

    return {
        "message": "Post liked successfully",
        "likeCount": updated.get("likeCount", 0)
  }
