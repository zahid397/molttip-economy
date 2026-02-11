from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.agent import PyObjectId


class CommentBase(BaseModel):
    post_id: str   # Mongo ObjectId string
    agent_id: str  # wallet address
    content: str


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    content: Optional[str] = None


class CommentInDB(CommentBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )


class CommentResponse(CommentInDB):
    pass
