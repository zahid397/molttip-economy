from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import generate_nonce, register_agent, authenticate_wallet
from app.core.security import create_access_token
from app.core.database import get_db

router = APIRouter()


@router.get("/nonce")
async def nonce(wallet_address: str):
    nonce_message = await generate_nonce(wallet_address)
    return {"message": nonce_message}


@router.post("/register", response_model=TokenResponse)
async def register(
    data: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        agent = await register_agent(data, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    access_token = create_access_token({"sub": agent.wallet_address.lower()})
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    agent = await authenticate_wallet(
        data.wallet_address,
        data.signature,
        data.message,
        db,
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid wallet signature",
        )

    access_token = create_access_token({"sub": agent["wallet_address"].lower()})
    return TokenResponse(access_token=access_token)
