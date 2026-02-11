from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.schemas.tip import TipRequest, TipResponse
from app.schemas.response import PaginatedResponse
from app.api.deps import get_current_user
from app.services.tip_service import execute_tip
from app.core.database import get_db

router = APIRouter()


@router.post("/", response_model=TipResponse)
async def create_tip(
    data: TipRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    from_wallet = current_user["wallet_address"].lower()
    to_wallet = data.to_wallet.lower()

    # 🚫 Cannot tip yourself
    if to_wallet == from_wallet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot tip yourself",
        )

    # 🚫 Prevent duplicate tx_hash (double spend protection)
    existing = await db.tips.find_one({"tx_hash": data.tx_hash})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction already used",
        )

    try:
        tip = await execute_tip(data, from_wallet, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return TipResponse(
        id=str(tip.id),
        from_wallet=tip.from_wallet,
        to_wallet=tip.to_wallet,
        amount=tip.amount,
        reason=tip.reason,
        tx_hash=tip.tx_hash,
        verified=tip.verified,
        created_at=tip.created_at,
    )


@router.get("/agent/{wallet_address}", response_model=PaginatedResponse[TipResponse])
async def get_tips_for_agent(
    wallet_address: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    wallet_address = wallet_address.lower()
    skip = (page - 1) * per_page

    query = {"to_wallet": wallet_address}
    total = await db.tips.count_documents(query)

    cursor = (
        db.tips.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    tips = await cursor.to_list(length=per_page)

    formatted_tips: List[TipResponse] = [
        TipResponse(
            id=str(t["_id"]),
            from_wallet=t["from_wallet"],
            to_wallet=t["to_wallet"],
            amount=t["amount"],
            reason=t.get("reason"),
            tx_hash=t["tx_hash"],
            verified=t.get("verified", False),
            created_at=t["created_at"],
        )
        for t in tips
    ]

    return PaginatedResponse[TipResponse](
        success=True,
        message="Tips fetched",
        data=formatted_tips,
        total=total,
        page=page,
        per_page=per_page,
    )
