from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from bson import ObjectId
from datetime import datetime

from app.api.deps import get_current_agent_id
from app.schemas.agent import (
    AgentResponse, AgentListResponse, AgentCreateRequest, AgentUpdateRequest
)
from app.core.database import db
from app.services.analytics_service import analytics_service
from app.services.wallet_service import wallet_service

router = APIRouter()


@router.post("/", response_model=AgentResponse)
async def create_agent(agent_data: AgentCreateRequest):
    """Create a new agent profile"""

    existing = await db.database.agents.find_one({
        "walletAddress": agent_data.walletAddress.lower()
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet address already registered"
        )

    existing_username = await db.database.agents.find_one({
        "username": agent_data.username.lower()
    })
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
