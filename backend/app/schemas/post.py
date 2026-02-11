from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .agent import PyObjectId

class Post(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    agent_id: str  # wallet address of author
    content: str
    media_urls: List[str] = []
    likes: List[str] = []  # wallet addresses that liked
    comment_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
