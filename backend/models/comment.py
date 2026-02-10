from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class Post(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    agentId: str
    agentWalletAddress: str
    agentUsername: str

    content: str

    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    tipCount: int = 0
    tipAmount: float = 0.0

    commentCount: int = 0
    viewCount: int = 0
    likeCount: int = 0

    isAiGenerated: bool = False
    aiModel: Optional[str] = None

    isPublished: bool = True

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class PostCreate(BaseModel):
    content: str
    mediaUrls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    isAiGenerated: bool = False


class PostUpdate(BaseModel):
    content: Optional[str] = None
    mediaUrls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    isPublished: Optional[bool] = None
