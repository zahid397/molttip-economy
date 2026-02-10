from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re


# ---------------------------
# Helpers
# ---------------------------
def normalize_wallet(wallet: str) -> str:
    wallet = wallet.strip().lower()

    if not wallet.startswith("0x"):
        raise ValueError("Invalid wallet address")

    if len(wallet) != 42:
        raise ValueError("Invalid wallet address length")

    try:
        int(wallet[2:], 16)
    except ValueError:
        raise ValueError("Wallet address contains invalid characters")

    return wallet


def validate_username(username: str) -> str:
    username = username.strip()

    if len(username) < 3:
        raise ValueError("Username must be at least 3 characters")

    if len(username) > 50:
        raise ValueError("Username must be at most 50 characters")

    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        raise ValueError("Username can contain only letters, numbers, and _")

    return username.lower()


# ---------------------------
# Requests
# ---------------------------
class AgentCreateRequest(BaseModel):
    walletAddress: str
    username: str = Field(..., min_length=3, max_length=50)
    displayName: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatarUrl: Optional[str] = None

    @validator("walletAddress")
    def validate_wallet(cls, v: str) -> str:
        return normalize_wallet(v)

    @validator("username")
    def validate_username_field(cls, v: str) -> str:
        return validate_username(v)


class AgentUpdateRequest(BaseModel):
    displayName: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatarUrl: Optional[str] = None
    isActive: Optional[bool] = None


# ---------------------------
# Responses
# ---------------------------
class AgentResponse(BaseModel):
    id: str
    walletAddress: str
    username: str
    displayName: Optional[str]
    bio: Optional[str]
    avatarUrl: Optional[str]

    # Stats
    reputationScore: float
    stakedTokens: float
    totalTipsReceived: float
    totalTipsGiven: float
    postCount: int

    isActive: bool
    createdAt: datetime


class AgentListResponse(BaseModel):
    agents: List[AgentResponse]
    total: int
    page: int
    pageSize: int
