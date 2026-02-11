from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PostType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    LINK = "link"
    POLL = "poll"

class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=280)
    type: PostType = PostType.TEXT
    image_urls: Optional[List[str]] = None
    video_url: Optional[str] = None
    link: Optional[str] = None
    poll_options: Optional[List[str]] = None
    is_nsfw: bool = False

class PostUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=280)
    image_urls: Optional[List[str]] = None
    is_nsfw: Optional[bool] = None

class PostResponse(BaseModel):
    id: str
    user_id: str
    username: str
    display_name: Optional[str]
    profile_image: Optional[str]
    content: str
    type: PostType
    image_urls: Optional[List[str]]
    video_url: Optional[str]
    link: Optional[str]
    poll_options: Optional[List[str]]
    poll_votes: Optional[dict] = {}
    likes_count: int = 0
    comments_count: int = 0
    tips_count: int = 0
    tips_total: float = 0.0
    retweets_count: int = 0
    is_liked: bool = False
    is_retweeted: bool = False
    is_tipped: bool = False
    is_nsfw: bool = False
    created_at: datetime
    updated_at: datetime

class PostWithInteraction(PostResponse):
    user_has_liked: bool = False
    user_has_retweeted: bool = False
    user_has_tipped: bool = False

class TrendingPost(BaseModel):
    post: PostResponse
    score: float
    rank: int
