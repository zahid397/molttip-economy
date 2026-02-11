from datetime import datetime
from typing import Dict, Any

from app.services.blockchain_service import verify_transfer
from app.core.database import get_db
from app.schemas.tip import TipRequest


async def execute_tip(
    tip_data: TipRequest,
    from_wallet: str,
    db
) -> Dict[str, Any]:

    from_wallet = from_wallet.lower()
    to_wallet = tip_data.to_wallet.lower()

    # -----------------------------
    # Basic validation
    # -----------------------------

    if from_wallet == to_wallet:
        raise ValueError("You cannot tip yourself")

    # Check receiver exists
    receiver = await db.agents.find_one({"wallet_address": to_wallet})
    if not receiver:
        raise ValueError("Recipient not found")

    # Prevent duplicate tx
    existing_tx = await db.tips.find_one({"tx_hash": tip_data.tx_hash})
    if existing_tx:
        raise ValueError("Transaction already recorded")

    # -----------------------------
    # Verify on-chain transfer
    # -----------------------------

    verified, actual_amount, actual_to = await verify_transfer(
        tip_data.tx_hash,
        from_wallet,
        to_wallet,
        tip_data.amount
    )

    if not verified:
        raise ValueError("Blockchain verification failed")

    if float(actual_amount) != float(tip_data.amount):
        raise ValueError("Transferred amount mismatch")

    # -----------------------------
    # Create tip record
    # -----------------------------

    tip_doc = {
        "from_wallet": from_wallet,
        "to_wallet": to_wallet,
        "amount": tip_data.amount,
        "reason": tip_data.reason,
        "tx_hash": tip_data.tx_hash,
        "verified": True,
        "created_at": datetime.utcnow(),
    }

    result = await db.tips.insert_one(tip_doc)
    tip_doc["_id"] = result.inserted_id

    # -----------------------------
    # Update stats (atomic style)
    # -----------------------------

    await db.agents.update_one(
        {"wallet_address": from_wallet},
        {
            "$inc": {
                "stats.total_tips_given": 1,
                "stats.total_tip_amount_given": tip_data.amount
            },
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    await db.agents.update_one(
        {"wallet_address": to_wallet},
        {
            "$inc": {
                "stats.total_tips_received": 1,
                "stats.total_tip_amount_received": tip_data.amount
            },
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    # -----------------------------
    # Log transactions
    # -----------------------------

    await db.transactions.insert_many([
        {
            "wallet_address": from_wallet,
            "tx_hash": tip_data.tx_hash,
            "type": "send",
            "counterparty": to_wallet,
            "amount": tip_data.amount,
            "timestamp": datetime.utcnow()
        },
        {
            "wallet_address": to_wallet,
            "tx_hash": tip_data.tx_hash,
            "type": "receive",
            "counterparty": from_wallet,
            "amount": tip_data.amount,
            "timestamp": datetime.utcnow()
        }
    ])

    # -----------------------------
    # Create notification
    # -----------------------------

    await db.notifications.insert_one({
        "user_id": to_wallet,
        "type": "tip_received",
        "content": {
            "from_wallet": from_wallet,
            "amount": tip_data.amount,
            "tx_hash": tip_data.tx_hash
        },
        "read": False,
        "created_at": datetime.utcnow()
    })

    return tip_doc
