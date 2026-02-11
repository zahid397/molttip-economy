from datetime import datetime, timedelta
from typing import Optional
import secrets

from app.core.security import create_access_token, verify_signature
from app.schemas.auth import RegisterRequest
from app.core.config import settings


# ----------------------------
# Nonce generation
# ----------------------------

async def generate_nonce(wallet_address: str) -> str:
    """
    Generate secure random nonce message for wallet login.
    Store this nonce in DB before asking user to sign it.
    """
    nonce = secrets.token_hex(16)
    message = f"Molttip Authentication\nWallet: {wallet_address}\nNonce: {nonce}"
    return message


# ----------------------------
# Register
# ----------------------------

async def register_agent(data: RegisterRequest, db):
    """
    Register new wallet user after verifying signature.
    """

    # Verify signature
    if not verify_signature(data.message, data.signature, data.wallet_address):
        raise ValueError("Invalid wallet signature")

    # Check if already exists
    existing = await db.agents.find_one({
        "wallet_address": data.wallet_address.lower()
    })
    if existing:
        raise ValueError("Wallet already registered")

    agent_doc = {
        "wallet_address": data.wallet_address.lower(),
        "username": data.username,
        "display_name": data.display_name,
        "bio": "",
        "avatar_url": "",
        "verified": False,
        "stats": {
            "total_tips_received": 0,
            "total_tips_given": 0,
            "total_tip_amount_received": 0.0,
            "total_tip_amount_given": 0.0,
            "post_count": 0,
            "comment_count": 0,
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.agents.insert_one(agent_doc)
    agent_doc["_id"] = result.inserted_id

    # Create JWT
    access_token = create_access_token(
        {"sub": agent_doc["wallet_address"]}
    )

    return {
        "agent": agent_doc,
        "access_token": access_token
    }


# ----------------------------
# Login
# ----------------------------

async def authenticate_wallet(
    wallet_address: str,
    signature: str,
    message: str,
    db
) -> Optional[dict]:
    """
    Verify signature and return JWT token if valid.
    """

    if not verify_signature(message, signature, wallet_address):
        return None

    agent = await db.agents.find_one({
        "wallet_address": wallet_address.lower()
    })

    if not agent:
        return None

    access_token = create_access_token(
        {"sub": wallet_address.lower()}
    )

    return {
        "agent": agent,
        "access_token": access_token
    }
