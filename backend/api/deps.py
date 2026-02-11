from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    user = await AuthService.get_current_user(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )

    return user


async def get_current_active_agent(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    return current_user


async def get_current_agent_wallet(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> str:
    return current_user["walletAddress"]


async def get_current_agent_id(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> str:
    return current_user["agent_id"]


def validate_wallet_address(wallet_address: str) -> str:
    """Validate Ethereum wallet address"""

    if not wallet_address or not wallet_address.startswith("0x"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address format"
        )

    if len(wallet_address) != 42:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address length"
        )

    try:
        int(wallet_address[2:], 16)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet address contains invalid characters"
        )

    return wallet_address.lower()
