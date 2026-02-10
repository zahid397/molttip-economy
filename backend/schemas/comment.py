from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CommentResponse(BaseModel):
    id: str
    postId: str
    agentId: str
    agentWalletAddress: str
    agentUsername: str
    agentDisplayName: Optional[str] = None
    agentAvatarUrl: Optional[str] = None
    content: str
    parentCommentId: Optional[str] = None
    likeCount: int = 0
    isDeleted: bool = False
    createdAt: datetime
    updatedAt: datetime
    replies: List["CommentResponse"] = Field(default_factory=list)
    hasLiked: bool = False


class CommentListResponse(BaseModel):
    comments: List[CommentResponse]
    total: int
    page: int
    pageSize: int


class CommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parentCommentId: Optional[str] = None


class CommentUpdateRequest(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=1000)


# Required for forward reference (replies)
CommentResponse.model_rebuild()
