from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.agent import Agent
from app.models.tip import Tip, TipStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.post import Post
from app.models.comment import Comment

from app.schemas.tip import TipCreate, TipResponse
from app.schemas.response import success_response, error_response


router = APIRouter()


# -------------------------
# Send Tip
# -------------------------
@router.post("/")
async def send_tip(
    tip_data: TipCreate,
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    # Can't tip yourself
    if tip_data.to_agent_id == current_user.id:
        return error_response("You cannot tip yourself", status_code=400)

    # Receiver must exist
    receiver = db.query(Agent).filter(
        Agent.id == tip_data.to_agent_id,
        Agent.is_active == True
    ).first()

    if not receiver:
        return error_response("Receiver not found", status_code=404)

    # Validate post/comment if provided
    if tip_data.post_id:
        post = db.query(Post).filter(Post.id == tip_data.post_id, Post.is_active == True).first()
        if not post:
            return error_response("Post not found", status_code=404)

    if tip_data.comment_id:
        comment = db.query(Comment).filter(Comment.id == tip_data.comment_id, Comment.is_active == True).first()
        if not comment:
            return error_response("Comment not found", status_code=404)

    # Create Tip
    new_tip = Tip(
        from_agent_id=current_user.id,
        to_agent_id=receiver.id,
        post_id=tip_data.post_id,
        comment_id=tip_data.comment_id,
        amount=tip_data.amount,
        token_symbol=tip_data.token_symbol,
        status=TipStatus.PENDING
    )

    db.add(new_tip)
    db.commit()
    db.refresh(new_tip)

    # Create Transaction (pending)
    new_tx = Transaction(
        agent_id=current_user.id,
        transaction_type=TransactionType.TIP,
        amount=tip_data.amount,
        token_symbol=tip_data.token_symbol,
        status=TransactionStatus.PENDING,
        from_address=current_user.wallet_address,
        to_address=receiver.wallet_address
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    # Update balances stats (simple logic)
    current_user.total_tips_given += tip_data.amount
    receiver.total_tips_received += tip_data.amount

    db.commit()

    response_data = TipResponse(
        **TipResponse.model_validate(new_tip).model_dump(),
        from_agent_username=current_user.username,
        to_agent_username=receiver.username
    )

    return success_response(
        data=response_data.model_dump(),
        message="Tip created successfully (pending blockchain confirmation)"
    )


# -------------------------
# Get Tips Sent by Current User
# -------------------------
@router.get("/sent")
async def get_sent_tips(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    tips = db.query(Tip).filter(
        Tip.from_agent_id == current_user.id
    ).order_by(Tip.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for t in tips:
        receiver = db.query(Agent).filter(Agent.id == t.to_agent_id).first()

        tip_response = TipResponse(
            **TipResponse.model_validate(t).model_dump(),
            from_agent_username=current_user.username,
            to_agent_username=receiver.username if receiver else "Unknown"
        )

        result.append(tip_response.model_dump())

    return success_response(result)


# -------------------------
# Get Tips Received by Current User
# -------------------------
@router.get("/received")
async def get_received_tips(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Agent = Depends(get_current_active_user)
):
    tips = db.query(Tip).filter(
        Tip.to_agent_id == current_user.id
    ).order_by(Tip.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for t in tips:
        sender = db.query(Agent).filter(Agent.id == t.from_agent_id).first()

        tip_response = TipResponse(
            **TipResponse.model_validate(t).model_dump(),
            from_agent_username=sender.username if sender else "Unknown",
            to_agent_username=current_user.username
        )

        result.append(tip_response.model_dump())

    return success_response(result)


# -------------------------
# Mark Tip Completed (Admin/Blockchain Callback)
# -------------------------
@router.put("/{tip_id}/complete")
async def mark_tip_completed(
    tip_id: int,
    transaction_hash: Optional[str] = None,
    db: Session = Depends(get_db)
):
    tip = db.query(Tip).filter(Tip.id == tip_id).first()

    if not tip:
        return error_response("Tip not found", status_code=404)

    tip.status = TipStatus.COMPLETED

    if transaction_hash:
        tip.transaction_hash = transaction_hash

    db.commit()
    db.refresh(tip)

    return success_response(
        data={
            "tip_id": tip.id,
            "status": tip.status,
            "transaction_hash": tip.transaction_hash
        },
        message="Tip marked as completed"
    )
