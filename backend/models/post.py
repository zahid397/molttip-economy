from datetime import datetime
from typing import Optional
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


class Agent(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    walletAddress: str
    username: str

    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None

    reputationScore: float = 0.0
    stakedTokens: float = 0.0
    totalTipsReceived: float = 0.0
    totalTipsGiven: float = 0.0
    postCount: int = 0

    isActive: bool = True

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class AgentCreate(BaseModel):
    walletAddress: str
    username: str
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None


class AgentUpdate(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    isActive: Optional[bool] = None


class AgentStats(BaseModel):
    walletAddress: str
    username: str
    reputationScore: float
    totalTipsReceived: float
    totalTipsGiven: float
    postCount: int
    rank: Optional[int] = Nonefrom datetime import datetime
from typing import Optional
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


class Agent(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    walletAddress: str
    username: str

    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None

    reputationScore: float = 0.0
    stakedTokens: float = 0.0
    totalTipsReceived: float = 0.0
    totalTipsGiven: float = 0.0
    postCount: int = 0

    isActive: bool = True

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class AgentCreate(BaseModel):
    walletAddress: str
    username: str
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None


class AgentUpdate(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    isActive: Optional[bool] = None


class AgentStats(BaseModel):
    walletAddress: str
    username: str
    reputationScore: float
    totalTipsReceived: float
    totalTipsGiven: float
    postCount: int
    rank: Optional[int] = Nonefrom datetime import datetime
from typing import Optional
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


class Agent(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    walletAddress: str
    username: str

    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None

    reputationScore: float = 0.0
    stakedTokens: float = 0.0
    totalTipsReceived: float = 0.0
    totalTipsGiven: float = 0.0
    postCount: int = 0

    isActive: bool = True

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class AgentCreate(BaseModel):
    walletAddress: str
    username: str
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None


class AgentUpdate(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    isActive: Optional[bool] = None


class AgentStats(BaseModel):
    walletAddress: str
    username: str
    reputationScore: float
    totalTipsReceived: float
    totalTipsGiven: float
    postCount: int
    rank: Optional[int] = Nonefrom datetime import datetime
from typing import Optional
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


class Agent(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    walletAddress: str
    username: str

    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None

    reputationScore: float = 0.0
    stakedTokens: float = 0.0
    totalTipsReceived: float = 0.0
    totalTipsGiven: float = 0.0
    postCount: int = 0

    isActive: bool = True

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class AgentCreate(BaseModel):
    walletAddress: str
    username: str
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None


class AgentUpdate(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    avatarUrl: Optional[str] = None
    isActive: Optional[bool] = None


class AgentStats(BaseModel):
    walletAddress: str
    username: str
    reputationScore: float
    totalTipsReceived: float
    totalTipsGiven: float
    postCount: int
    rank: Optional[int] = None
