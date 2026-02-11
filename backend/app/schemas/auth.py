from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    wallet_address: str = Field(..., min_length=10)
    signature: str = Field(..., min_length=10)
    message: str = Field(..., min_length=3)


class RegisterRequest(BaseModel):
    wallet_address: str = Field(..., min_length=10)
    username: str = Field(..., min_length=3, max_length=30)
    display_name: Optional[str] = Field(default=None, max_length=50)

    signature: str = Field(..., min_length=10)
    message: str = Field(..., min_length=3)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
