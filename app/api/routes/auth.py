from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, 
    RefreshTokenRequest, ResetPasswordRequest, ForgotPasswordRequest
)
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.utils.response import Response

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
auth_service = AuthService()

@router.post("/register", response_model=Dict[str, Any])
async def register(request: RegisterRequest):
    """Register a new user"""
    result = await auth_service.register(request)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    return result

@router.post("/login", response_model=Dict[str, Any])
async def login(request: LoginRequest):
    """Login user"""
    result = await auth_service.login(request.email, request.password)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["error"]
        )
    return result

@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token"""
    result = await auth_service.refresh_token(request.refresh_token)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result["error"]
        )
    return result

@router.post("/logout", response_model=Dict[str, Any])
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Logout user (client should discard tokens)"""
    return Response.success(message="Logged out successfully")

@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user profile"""
    return Response.success(
        message="Profile retrieved",
        data=current_user
    )

@router.post("/forgot-password", response_model=Dict[str, Any])
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset"""
    # In production, send email with reset link
    return Response.success(
        message="If the email exists, a reset link has been sent"
    )

@router.post("/reset-password", response_model=Dict[str, Any])
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    # In production, verify token and update password
    return Response.success(message="Password reset successfully")
