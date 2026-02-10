from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re


# ---------------------------
# Helpers
# ---------------------------
def normalize_wallet(wallet: str) -> str:
    if not wallet:
        raise ValueError("Wallet address is required")

    wallet = wallet.strip().lower()

    if not wallet.startswith("0x"):
        raise ValueError("Invalid wallet address (must start with 0x)")

    if len(wallet) != 42:
        raise ValueError("Invalid wallet address length")

    # Check valid hex
    try:
        int(wallet[2:], 16)
    except ValueError:
        raise ValueError("Wallet address contains invalid characters")

    return wallet


def validate_username(username: str) -> str:
    username = username.strip()

    if len(username) < 3:
        raise ValueError("Username must be at least 3 characters long")

    if len(username) > 50:
        raise ValueError("Username must be less than 50 characters")

    # Only allow letters, numbers, underscore
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        raise ValueError("Username can only contain letters, numbers, and underscore (_)")

    return username.lower()


# ---------------------------
# Schemas
# ---------------------------
class UserSignup(BaseModel):
    walletAddress: str = Field(..., description="Ethereum wallet address")
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    displayName: Optional[str] = Field(None, max_length=100)

    # Optional for non-web3 auth
    password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=128,
        description="Password for email/password login (optional)",
    )

    @validator("walletAddress")
    def validate_wallet(cls, v: str) -> str:
        return normalize_wallet(v)

    @validator("username")
    def validate_username_field(cls, v: str) -> str:
        return validate_username(v)


class UserLogin(BaseModel):
    walletAddress: str = Field(..., description="Ethereum wallet address")

    # Web3 login
    signature: Optional[str] = Field(
        None,
        description="Wallet signature (required for Web3 login)",
    )

    # Password login
    password: Optional[str] = Field(
        None,
        description="Password (required for password login)",
    )

    @validator("walletAddress")
    def validate_wallet(cls, v: str) -> str:
        return normalize_wallet(v)


class WalletVerify(BaseModel):
    walletAddress: str = Field(..., description="Ethereum wallet address")
    message: str = Field(..., min_length=10, max_length=500)
    signature: str = Field(..., min_length=10)

    @validator("walletAddress")
    def validate_wallet(cls, v: str) -> str:
        return normalize_wallet(v)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    walletAddress: Optional[str] = None
    username: Optional[str] = None
    role: str = "user"
