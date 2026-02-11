from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source, _handler):
        from pydantic_core import core_schema

        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class AgentBase(BaseModel):
    wallet_address: str
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = ""
    avatar_url: Optional[str] = ""
    verified: bool = False


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class AgentInDB(AgentBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    stats: Dict[str, Any] = Field(default_factory=lambda: {
        "total_tips_received": 0,
        "total_tips_given": 0,
        "total_tip_amount_received": 0.0,
        "total_tip_amount_given": 0.0,
        "post_count": 0,
        "comment_count": 0,
    })

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )


class AgentResponse(AgentInDB):
    """Response schema for API output"""
    pass
