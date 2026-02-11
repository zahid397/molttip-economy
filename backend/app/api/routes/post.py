from fastapi import APIRouter, Depends, Query, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.schemas.post import PostCreate, PostResponse
from app.schemas.response import PaginatedResponse
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.post("/", response_model=PostResponse)
async def create_post(
    data: PostCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    post_doc = {
        "agent_id": current_user["wallet_address"].lower(),
        "content": data.content,
        "media_urls": data.media_urls or [],
        "likes": [],
        "comment_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.posts.insert_one(post_doc)

    # Increment post count
    await db.agents.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"stats.post_count": 1}},
    )

    created_post = await db.posts.find_one({"_id": result.inserted_id})

    if not created_post:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Post creation failed",
        )

    return PostResponse(
        id=str(created_post["_id"]),
        agent_id=created_post["agent_id"],
        content=created_post["content"],
        media_urls=created_post.get("media_urls", []),
        likes=created_post.get("likes", []),
        comment_count=created_post.get("comment_count", 0),
        created_at=created_post["created_at"],
        updated_at=created_post["updated_at"],
    )


@router.get("/", response_model=PaginatedResponse[PostResponse])
async def get_feed(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    skip = (page - 1) * per_page

    total = await db.posts.count_documents({})

    cursor = (
        db.posts.find()
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    posts = await cursor.to_list(length=per_page)

    formatted_posts = [
        PostResponse(
            id=str(p["_id"]),
            agent_id=p["agent_id"],
            content=p["content"],
            media_urls=p.get("media_urls", []),
            likes=p.get("likes", []),
            comment_count=p.get("comment_count", 0),
            created_at=p["created_at"],
            updated_at=p["updated_at"],
        )
        for p in posts
    ]

    return {
        "success": True,
        "message": "Feed fetched",
        "data": formatted_posts,
        "total": total,
        "page": page,
        "per_page": per_page,
    }
