from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import Optional
from bson import ObjectId
from datetime import datetime

from app.api.deps import get_current_agent_wallet
from app.schemas.tip import TipResponse, TipListResponse, TipCreateRequest
from app.core.database import db
from app.services.notification_service import notification_service
from app.tasks.process_pending_tips import process_tip_verification

router = APIRouter()


@router.post("/", response_model=TipResponse)
async def create_tip(
    tip_data: TipCreateRequest,
    background_tasks: BackgroundTasks,
    current_wallet: str = Depends(get_current_agent_wallet)
):
    """Create a new pending tip"""

    if tip_data.fromAddress.lower() != current_wallet.lower():
        raise HTTPException(status_code=403, detail="Wallet mismatch")

    if not ObjectId.is_valid(tip_data.postId):
        raise HTTPException(status_code=400, detail="Invalid post ID")

    post = await db.database.posts.find_one({"_id": ObjectId(tip_data.postId)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if await db.database.tips.find_one({"txHash": tip_data.txHash}):
        raise HTTPException(status_code=400, detail="Transaction already recorded")

    from_agent = await db.database.agents.find_one(
        {"walletAddress": tip_data.fromAddress.lower()}
    )
    to_agent = await db.database.agents.find_one(
        {"walletAddress": tip_data.toAddress.lower()}
    )

    tip = {
        "txHash": tip_data.txHash,
        "fromAddress": tip_data.fromAddress.lower(),
        "toAddress": tip_data.toAddress.lower(),
        "fromAgentId": str(from_agent["_id"]) if from_agent else None,
        "toAgentId": str(to_agent["_id"]) if to_agent else None,
        "postId": tip_data.postId,
        "amount": 0,  # VERIFIED LATER
        "tokenSymbol": tip_data.tokenSymbol,
        "message": tip_data.message,
        "status": "pending",
        "createdAt": datetime.utcnow()
    }

    result = await db.database.tips.insert_one(tip)
    tip["_id"] = result.inserted_id
    tip["id"] = str(result.inserted_id)

    background_tasks.add_task(process_tip_verification, str(result.inserted_id))

    return tip


@router.get("/{tip_id}", response_model=TipResponse)
async def get_tip(tip_id: str):
    if not ObjectId.is_valid(tip_id):
        raise HTTPException(status_code=400, detail="Invalid tip ID")

    tip = await db.database.tips.find_one({"_id": ObjectId(tip_id)})
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")

    tip["id"] = str(tip["_id"])
    return tip


@router.get("/", response_model=TipListResponse)
async def list_tips(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    wallet_address: Optional[str] = None
):
    skip = (page - 1) * page_size

    query = {}
    if wallet_address:
        query["$or"] = [
            {"fromAddress": wallet_address.lower()},
            {"toAddress": wallet_address.lower()}
        ]

    pipeline = [
        {"$match": query},
        {"$sort": {"createdAt": -1}},
        {"$skip": skip},
        {"$limit": page_size},
        {
            "$lookup": {
                "from": "agents",
                "localField": "fromAgentId",
                "foreignField": "_id",
                "as": "fromAgent"
            }
        },
        {
            "$lookup": {
                "from": "agents",
                "localField": "toAgentId",
                "foreignField": "_id",
                "as": "toAgent"
            }
        }
    ]

    tips = await db.database.tips.aggregate(pipeline).to_list(length=page_size)

    for t in tips:
        t["id"] = str(t["_id"])
        t["fromUsername"] = t["fromAgent"][0]["username"] if t.get("fromAgent") else None
        t["toUsername"] = t["toAgent"][0]["username"] if t.get("toAgent") else None
        t.pop("fromAgent", None)
        t.pop("toAgent", None)

    total = await db.database.tips.count_documents(query)

    return {
        "tips": tips,
        "total": total,
        "page": page,
        "pageSize": page_size
  }
