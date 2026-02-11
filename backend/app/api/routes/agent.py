from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.schemas.agent import AgentProfile, AgentUpdate
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.get("/{wallet_address}", response_model=AgentProfile)
async def get_agent(
    wallet_address: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    agent = await db.agents.find_one({"wallet_address": wallet_address.lower()})

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent


@router.put("/me", response_model=AgentProfile)
async def update_agent(
    updates: AgentUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    update_data = {
        k: v for k, v in updates.model_dump(exclude_unset=True).items()
        if v is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update fields provided",
        )

    update_data["updated_at"] = datetime.utcnow()

    await db.agents.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data},
    )

    updated_agent = await db.agents.find_one({"_id": current_user["_id"]})

    if not updated_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found after update",
        )

    return updated_agent
