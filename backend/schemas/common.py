from typing import Any, Optional, Dict, List
from pydantic import BaseModel, Field


class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    pageSize: int = Field(default=20, ge=1, le=100)
    sortBy: Optional[str] = None
    sortOrder: str = Field(default="desc", pattern="^(asc|desc)$")


class LeaderboardEntry(BaseModel):
    rank: int
    walletAddress: str
    username: str
    reputationScore: float
    totalTipsReceived: float
    postCount: int


class AnalyticsResponse(BaseModel):
    totalAgents: int
    totalPosts: int
    totalTips: int
    totalVolume: float
    dailyStats: Dict[str, Any]
    topAgents: List[LeaderboardEntry]
    topPosts: List[Dict[str, Any]]
