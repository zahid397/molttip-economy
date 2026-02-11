from pydantic import BaseModel, Generic, TypeVar
from typing import Optional, List, Generic, TypeVar
from datetime import datetime

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: str
    details: Optional[dict] = None

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    display_name: Optional[str]
    profile_image: Optional[str]
    total_tips_received: float
    total_posts: int
    followers_count: int
    score: float

class AnalyticsResponse(BaseModel):
    total_users: int
    total_posts: int
    total_tips: int
    total_transactions: float
    daily_active_users: int
    new_users_today: int
    tips_today: float
    posts_today: int
    trending_posts: List[dict]
    top_tippers: List[dict]
    top_creators: List[dict]
