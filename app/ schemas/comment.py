from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    post_id: str
    content: str = Field(..., min_length=1, max_length=500)
    parent_comment_id: Optional[str] = None

class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)

class CommentResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    username: str
    display_name: Optional[str]
    profile_image: Optional[str]
    content: str
    parent_comment_id: Optional[str]
    likes_count: int = 0
    tips_count: int = 0
    tips_total: float = 0.0
    replies_count: int = 0
    is_liked: bool = False
    created_at: datetime
    updated_at: datetime

class CommentWithReplies(CommentResponse):
    replies: list = []
