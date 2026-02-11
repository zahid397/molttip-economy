from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.agent import Agent
from app.schemas.response import success_response, error_response

router = APIRouter()


@router.post("/")
async def create_comment(
    post_id: int,
    content: str,
    parent_comment_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not post:
        return error_response("Post not found", status_code=404)

    new_comment = Comment(
        agent_id=current_user.id,
        post_id=post_id,
        content=content,
        parent_comment_id=parent_comment_id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return success_response(
        {
            "id": new_comment.id,
            "post_id": new_comment.post_id,
            "agent_id": new_comment.agent_id,
            "content": new_comment.content,
            "created_at": str(new_comment.created_at)
        },
        message="Comment created"
    )


@router.get("/")
async def get_comments(
    post_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Comment).filter(Comment.post_id == post_id, Comment.is_active == True)

    comments = query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()

    return success_response({
        "items": [
            {
                "id": c.id,
                "post_id": c.post_id,
                "agent_id": c.agent_id,
                "content": c.content,
                "created_at": str(c.created_at)
            }
            for c in comments
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    })
