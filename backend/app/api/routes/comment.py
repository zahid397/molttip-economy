from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.comment import CommentCreate, CommentResponse
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.post("/{post_id}", response_model=CommentResponse)
async def add_comment(
    post_id: str,
    data: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # Validate ObjectId
    try:
        post_object_id = ObjectId(post_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID",
        )

    # Check if post exists
    post = await db.posts.find_one({"_id": post_object_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )

    comment_doc = {
        "post_id": post_id,
        "agent_id": current_user["wallet_address"].lower(),
        "content": data.content,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.comments.insert_one(comment_doc)

    # Increment comment count on post
    await db.posts.update_one(
        {"_id": post_object_id},
        {"$inc": {"comment_count": 1}},
    )

    # Increment comment count on agent
    await db.agents.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"stats.comment_count": 1}},
    )

    created_comment = await db.comments.find_one({"_id": result.inserted_id})

    if not created_comment:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Comment creation failed",
        )

    return CommentResponse(
        id=str(created_comment["_id"]),
        post_id=created_comment["post_id"],
        agent_id=created_comment["agent_id"],
        content=created_comment["content"],
        created_at=created_comment["created_at"],
        updated_at=created_comment["updated_at"],
    )
