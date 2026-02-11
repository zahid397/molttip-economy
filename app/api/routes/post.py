from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.agent import Agent
from app.models.post import Post
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.schemas.response import success_response, error_response


router = APIRouter()


# -------------------------
# Create Post
# -------------------------
@router.post("/")
async def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    new_post = Post(
        agent_id=current_user.id,
        content=post_data.content,
        platform=post_data.platform,
        platform_post_id=post_data.platform_post_id,
        media_urls=post_data.media_urls
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    response_data = PostResponse(
        **PostResponse.model_validate(new_post).model_dump(),
        agent_username=current_user.username
    )

    return success_response(
        data=response_data.model_dump(),
        message="Post created successfully"
    )


# -------------------------
# Get All Posts (Feed)
# -------------------------
@router.get("/")
async def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    agent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Post).filter(Post.is_active == True)

    if agent_id:
        query = query.filter(Post.agent_id == agent_id)

    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()

    result = []
    for post in posts:
        agent = db.query(Agent).filter(Agent.id == post.agent_id).first()

        post_data = PostResponse(
            **PostResponse.model_validate(post).model_dump(),
            agent_username=agent.username if agent else None
        )

        result.append(post_data.model_dump())

    return success_response({
        "items": result,
        "total": total,
        "skip": skip,
        "limit": limit
    })


# -------------------------
# Get Single Post
# -------------------------
@router.get("/{post_id}")
async def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()

    if not post:
        return error_response("Post not found", status_code=404)

    agent = db.query(Agent).filter(Agent.id == post.agent_id).first()

    post_data = PostResponse(
        **PostResponse.model_validate(post).model_dump(),
        agent_username=agent.username if agent else None
    )

    return success_response(post_data.model_dump())


# -------------------------
# Update Post
# -------------------------
@router.put("/{post_id}")
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post or not post.is_active:
        return error_response("Post not found", status_code=404)

    if post.agent_id != current_user.id:
        return error_response("Not authorized to update this post", status_code=403)

    for key, value in post_data.model_dump(exclude_unset=True).items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)

    agent = db.query(Agent).filter(Agent.id == post.agent_id).first()

    post_response = PostResponse(
        **PostResponse.model_validate(post).model_dump(),
        agent_username=agent.username if agent else None
    )

    return success_response(
        data=post_response.model_dump(),
        message="Post updated successfully"
    )


# -------------------------
# Delete Post (Soft Delete)
# -------------------------
@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        return error_response("Post not found", status_code=404)

    if post.agent_id != current_user.id:
        return error_response("Not authorized to delete this post", status_code=403)

    post.is_active = False
    db.commit()

    return success_response(message="Post deleted successfully")
