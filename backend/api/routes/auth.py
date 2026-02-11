from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from datetime import timedelta

from app.schemas.auth import UserSignup, UserLogin, Token, WalletVerify
from app.services.auth_service import AuthService
from app.services.wallet_service import wallet_service
from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.core.config import settings

router = APIRouter()


@router.post("/signup", response_model=Token)
async def signup(user_data: UserSignup):
    """Register a new agent"""
    result = await AuthService.register_agent(user_data)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet address or username already exists"
        )

    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/login")
async def login(login_data: UserLogin):
    """Login with wallet address"""

    agent = await AuthService.authenticate_wallet(login_data.walletAddress)

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Agent not found"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={
            "sub": agent["walletAddress"],
            "username": agent["username"],
            "agent_id": agent["id"]
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "agent": agent
    }


@router.post("/verify-wallet")
async def verify_wallet(verify_data: WalletVerify):
    """Verify wallet ownership with signature"""

    is_valid = await wallet_service.verify_wallet_ownership(
        wallet_address=verify_data.walletAddress,
        signature=verify_data.signature,
        message=verify_data.message
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature"
        )

    # Check if agent exists
    agent = await AuthService.authenticate_wallet(verify_data.walletAddress)

    if agent:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        access_token = create_access_token(
            data={
                "sub": agent["walletAddress"],
                "username": agent["username"],
                "agent_id": agent["id"]
            },
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "agent": agent,
            "is_new": False
        }

    return {
        "message": "Wallet verified but agent not registered",
        "is_new": True,
        "wallet_address": verify_data.walletAddress.lower()
    }


@router.get("/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current authenticated user info"""
    return current_user
