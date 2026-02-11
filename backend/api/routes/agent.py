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
        )

    agent = {
        "walletAddress": agent_data.walletAddress.lower(),
        "username": agent_data.username,
        "displayName": agent_data.displayName or agent_data.username,
        "bio": agent_data.bio or "",
        "avatarUrl": agent_data.avatarUrl or "",
        "reputationScore": 100.0,
        "stakedTokens": 0.0,
        "totalTipsReceived": 0.0,
        "totalTipsGiven": 0.0,
        "postCount": 0,
        "isActive": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = await db.database.agents.insert_one(agent)
    agent["_id"] = result.inserted_id
    agent["id"] = str(result.inserted_id)

    return agent


@router.get("/wallet/{wallet_address}", response_model=AgentResponse)
async def get_agent_by_wallet(wallet_address: str):
    """Get agent by wallet address"""

    agent = await db.database.agents.find_one({
        "walletAddress": wallet_address.lower()
    })

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    agent["id"] = str(agent["_id"])
    return agent


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get agent by ID"""

    if not ObjectId.is_valid(agent_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID"
        )

    agent = await db.database.agents.find_one({"_id": ObjectId(agent_id)})

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    agent["id"] = str(agent["_id"])
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdateRequest,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Update agent profile"""

    if agent_id != current_agent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another agent's profile"
        )

    if not ObjectId.is_valid(agent_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID"
        )

    update_data = agent_data.dict(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )

    update_data["updatedAt"] = datetime.utcnow()

    result = await db.database.agents.update_one(
        {"_id": ObjectId(agent_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    agent = await db.database.agents.find_one({"_id": ObjectId(agent_id)})
    agent["id"] = str(agent["_id"])

    return agent


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: str = Query("reputationScore", pattern="^(reputationScore|createdAt|totalTipsReceived)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    """List agents with pagination and filtering"""

    skip = (page - 1) * page_size

    query = {"isActive": True}

    if search:
        query["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"displayName": {"$regex": search, "$options": "i"}},
            {"walletAddress": {"$regex": search, "$options": "i"}}
        ]

    sort_direction = -1 if sort_order == "desc" else 1
    sort = [(sort_by, sort_direction)]

    cursor = db.database.agents.find(query).sort(sort).skip(skip).limit(page_size)
    agents = await cursor.to_list(length=page_size)

    formatted_agents = []
    for agent in agents:
        agent["id"] = str(agent["_id"])
        formatted_agents.append(agent)

    total = await db.database.agents.count_documents(query)

    return {
        "agents": formatted_agents,
        "total": total,
        "page": page,
        "pageSize": page_size
    }


@router.get("/{agent_id}/analytics")
async def get_agent_analytics(agent_id: str):
    """Get analytics for an agent"""

    analytics = await analytics_service.get_agent_analytics(agent_id)

    if not analytics.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=analytics.get("error", "Agent not found")
        )

    return analytics


@router.get("/{agent_id}/wallet-stats")
async def get_wallet_stats(
    agent_id: str,
    current_agent_id: str = Depends(get_current_agent_id)
):
    """Get wallet statistics for an agent"""

    if agent_id != current_agent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another agent's wallet stats"
        )

    agent = await db.database.agents.find_one({"_id": ObjectId(agent_id)})

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )

    stats = await wallet_service.get_wallet_stats(agent["walletAddress"])

    if not stats.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=stats.get("error", "Failed to get wallet stats")
        )

    return stats
