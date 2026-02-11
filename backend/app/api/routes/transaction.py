from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.schemas.transaction import TransactionResponse
from app.schemas.response import PaginatedResponse
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[TransactionResponse])
async def get_my_transactions(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    wallet = current_user["wallet_address"].lower()
    skip = (page - 1) * per_page

    query = {"wallet_address": wallet}
    total = await db.transactions.count_documents(query)

    cursor = (
        db.transactions.find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(per_page)
    )

    txs = await cursor.to_list(length=per_page)

    formatted: List[TransactionResponse] = [
        TransactionResponse(
            id=str(tx["_id"]),
            wallet_address=tx["wallet_address"],
            tx_hash=tx["tx_hash"],
            type=tx["type"],
            counterparty=tx["counterparty"],
            amount=tx["amount"],
            timestamp=tx["timestamp"],
        )
        for tx in txs
    ]

    return PaginatedResponse[TransactionResponse](
        success=True,
        message="Transactions fetched",
        data=formatted,
        total=total,
        page=page,
        per_page=per_page,
    )
