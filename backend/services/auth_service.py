from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

from app.core.database import db
from app.core.security import get_password_hash, create_access_token, verify_token
from app.core.config import settings
from app.models.agent import Agent
from app.schemas.auth import UserSignup

logger = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    async def authenticate_wallet(wallet_address: str) -> Optional[Dict[str, Any]]:
        """Authenticate user by wallet address (Web3 login)"""
        try:
            wallet_address = wallet_address.lower().strip()

            agent = await db.database.agents.find_one(
                {"walletAddress": wallet_address}
            )

            if not agent:
                return None

            # Update last login timestamp
            await db.database.agents.update_one(
                {"_id": agent["_id"]},
                {"$set": {"updatedAt": datetime.utcnow()}}
            )

            return {
                "walletAddress": agent["walletAddress"],
                "username": agent["username"],
                "agent_id": str(agent["_id"]),
                "is_active": agent.get("isActive", True),
            }

        except Exception as e:
            logger.error(f"Wallet authentication error: {e}")
            return None

    @staticmethod
    async def register_agent(user_data: UserSignup) -> Optional[Dict[str, Any]]:
        """Register a new agent"""
        try:
            wallet_address = user_data.walletAddress.lower().strip()
            username = user_data.username.strip()

            # Check if wallet or username already exists
            existing_agent = await db.database.agents.find_one({
                "$or": [
                    {"walletAddress": wallet_address},
                    {"username": username.lower()}
                ]
            })

            if existing_agent:
                return None

            # Create agent document
            agent_data = Agent(
                walletAddress=wallet_address,
                username=username,
                displayName=user_data.displayName or username,
                bio=None,
                avatarUrl=None,
                reputationScore=0.0,
                stakedTokens=0.0,
                totalTipsReceived=0.0,
                totalTipsGiven=0.0,
                postCount=0,
                isActive=True,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            ).dict(by_alias=True, exclude_none=True)

            # Add optional password auth
            if user_data.password:
                agent_data["passwordHash"] = get_password_hash(user_data.password)

            # Add optional email if provided
            if user_data.email:
                agent_data["email"] = user_data.email

            result = await db.database.agents.insert_one(agent_data)

            # Generate JWT
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={
                    "sub": wallet_address,
                    "username": username,
                    "agent_id": str(result.inserted_id)
                },
                expires_delta=access_token_expires
            )

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "agent_id": str(result.inserted_id),
                "wallet_address": wallet_address,
                "username": username
            }

        except Exception as e:
            logger.error(f"Agent registration error: {e}")
            return None

    @staticmethod
    async def verify_token_and_get_user(token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return user info"""
        try:
            payload = verify_token(token)

            if not payload:
                return None

            wallet_address = payload.get("sub")
            if not wallet_address:
                return None

            wallet_address = wallet_address.lower().strip()

            agent = await db.database.agents.find_one(
                {"walletAddress": wallet_address}
            )

            if not agent:
                return None

            if not agent.get("isActive", True):
                return None

            return {
                "walletAddress": agent["walletAddress"],
                "username": agent["username"],
                "agent_id": str(agent["_id"]),
                "is_active": agent.get("isActive", True)
            }

        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None

    @staticmethod
    async def get_current_user(token: str) -> Optional[Dict[str, Any]]:
        """Alias for getting user"""
        return await AuthService.verify_token_and_get_user(token)
