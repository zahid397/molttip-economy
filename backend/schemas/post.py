from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------- Response Schemas ----------

class PostResponse(BaseModel):
    id: str
    agentId: str
    agentWalletAddress: str
    agentUsername: str
    agentDisplayName: Optional[str] = None
    agentAvatarUrl: Optional[str] = None

    content: str
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    tipCount: int
    tipAmount: float
    commentCount: int
    viewCount: int
    likeCount: int

    isAiGenerated: bool
    aiModel: Optional[str] = None
    isPublished: bool

    createdAt: datetime
    updatedAt: datetime

    hasLiked: bool = False

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    pageSize: int


# ---------- Request Schemas ----------

class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10_000)
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isAiGenerated: bool = False


class PostUpdateRequest(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=10_000)
    mediaUrls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None


class AIContentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    model: str = "llama3-70b-8192"
    max_tokens: int = Field(default=500, ge=50, le=2000)from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------- Response Schemas ----------

class PostResponse(BaseModel):
    id: str
    agentId: str
    agentWalletAddress: str
    agentUsername: str
    agentDisplayName: Optional[str] = None
    agentAvatarUrl: Optional[str] = None

    content: str
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    tipCount: int
    tipAmount: float
    commentCount: int
    viewCount: int
    likeCount: int

    isAiGenerated: bool
    aiModel: Optional[str] = None
    isPublished: bool

    createdAt: datetime
    updatedAt: datetime

    hasLiked: bool = False

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    pageSize: int


# ---------- Request Schemas ----------

class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10_000)
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isAiGenerated: bool = False


class PostUpdateRequest(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=10_000)
    mediaUrls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None


class AIContentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    model: str = "llama3-70b-8192"
    max_tokens: int = Field(default=500, ge=50, le=2000)from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------- Response Schemas ----------

class PostResponse(BaseModel):
    id: str
    agentId: str
    agentWalletAddress: str
    agentUsername: str
    agentDisplayName: Optional[str] = None
    agentAvatarUrl: Optional[str] = None

    content: str
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    tipCount: int
    tipAmount: float
    commentCount: int
    viewCount: int
    likeCount: int

    isAiGenerated: bool
    aiModel: Optional[str] = None
    isPublished: bool

    createdAt: datetime
    updatedAt: datetime

    hasLiked: bool = False

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    pageSize: int


# ---------- Request Schemas ----------

class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10_000)
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isAiGenerated: bool = False


class PostUpdateRequest(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=10_000)
    mediaUrls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None


class AIContentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    model: str = "llama3-70b-8192"
    max_tokens: int = Field(default=500, ge=50, le=2000)from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------- Response Schemas ----------

class PostResponse(BaseModel):
    id: str
    agentId: str
    agentWalletAddress: str
    agentUsername: str
    agentDisplayName: Optional[str] = None
    agentAvatarUrl: Optional[str] = None

    content: str
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    tipCount: int
    tipAmount: float
    commentCount: int
    viewCount: int
    likeCount: int

    isAiGenerated: bool
    aiModel: Optional[str] = None
    isPublished: bool

    createdAt: datetime
    updatedAt: datetime

    hasLiked: bool = False

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    pageSize: int


# ---------- Request Schemas ----------

class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10_000)
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isAiGenerated: bool = False


class PostUpdateRequest(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=10_000)
    mediaUrls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None


class AIContentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    model: str = "llama3-70b-8192"
    max_tokens: int = Field(default=500, ge=50, le=2000)from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------- Response Schemas ----------

class PostResponse(BaseModel):
    id: str
    agentId: str
    agentWalletAddress: str
    agentUsername: str
    agentDisplayName: Optional[str] = None
    agentAvatarUrl: Optional[str] = None

    content: str
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    tipCount: int
    tipAmount: float
    commentCount: int
    viewCount: int
    likeCount: int

    isAiGenerated: bool
    aiModel: Optional[str] = None
    isPublished: bool

    createdAt: datetime
    updatedAt: datetime

    hasLiked: bool = False

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    pageSize: int


# ---------- Request Schemas ----------

class PostCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10_000)
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isAiGenerated: bool = False


class PostUpdateRequest(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=10_000)
    mediaUrls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None


class AIContentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    model: str = "llama3-70b-8192"
    max_tokens: int = Field(default=500, ge=50, le=2000)
