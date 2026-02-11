from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
import logging
from app.core.database import agents_collection, get_async_collection
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas.auth import RegisterRequest
from app.utils.response import Response
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.notification_service = NotificationService()
    
    async def register(self, data: RegisterRequest) -> Dict[str, Any]:
        """Register a new agent"""
        try:
            # Check if email already exists
            existing_agent = await agents_collection.find_one({"email": data.email})
            if existing_agent:
                return Response.error("Email already registered")
            
            # Check if username already exists
            existing_username = await agents_collection.find_one({"username": data.username})
            if existing_username:
                return Response.error("Username already taken")
            
            # Create agent document
            agent_data = {
                "username": data.username,
                "email": data.email,
                "password": hash_password(data.password),
                "display_name": data.display_name or data.username,
                "bio": data.bio or "",
                "profile_image": data.profile_image or f"https://ui-avatars.com/api/?name={data.username}&background=random",
                "wallet_address": data.wallet_address,
                "wallet_balance": 100.0,  # Initial balance
                "total_tips_received": 0.0,
                "total_tips_sent": 0.0,
                "followers_count": 0,
                "following_count": 0,
                "posts_count": 0,
                "role": "user",
                "is_verified": False,
                "is_active": True,
                "notification_preferences": {
                    "email_tips": True,
                    "email_follows": True,
                    "email_likes": True,
                    "email_comments": True,
                    "push_tips": True,
                    "push_follows": True,
                    "push_likes": True,
                    "push_comments": True,
                    "in_app_tips": True,
                    "in_app_follows": True,
                    "in_app_likes": True,
                    "in_app_comments": True
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert into database
            result = await agents_collection.insert_one(agent_data)
            agent_id = str(result.inserted_id)
            
            # Create tokens
            token_data = {"sub": agent_id, "email": data.email, "username": data.username}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            # Send welcome notification
            await self.notification_service.create_notification(
                user_id=agent_id,
                type="system",
                title="Welcome to Molttip!",
                message="🎉 Welcome to the community! Start tipping and connecting with creators.",
                data={"type": "welcome"}
            )
            
            return Response.success(
                message="Registration successful",
                data={
                    "id": agent_id,
                    "username": data.username,
                    "email": data.email,
                    "display_name": agent_data["display_name"],
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "expires_in": 3600
                }
            )
            
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return Response.error("Registration failed")
    
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login agent"""
        try:
            agent = await agents_collection.find_one({"email": email})
            if not agent:
                return Response.error("Invalid credentials")
            
            if not verify_password(password, agent["password"]):
                return Response.error("Invalid credentials")
            
            if not agent.get("is_active", True):
                return Response.error("Account is deactivated")
            
            agent_id = str(agent["_id"])
            token_data = {"sub": agent_id, "email": agent["email"], "username": agent["username"]}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            # Update last login
            await agents_collection.update_one(
                {"_id": agent["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            return Response.success(
                message="Login successful",
                data={
                    "id": agent_id,
                    "username": agent["username"],
                    "email": agent["email"],
                    "display_name": agent.get("display_name"),
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "expires_in": 3600
                }
            )
            
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response.error("Login failed")
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token"""
        try:
            from app.core.security import verify_token
            payload = verify_token(refresh_token)
            
            if not payload or payload.get("type") != "refresh":
                return Response.error("Invalid refresh token")
            
            agent_id = payload.get("sub")
            agent = await agents_collection.find_one({"_id": ObjectId(agent_id)})
            
            if not agent:
                return Response.error("Agent not found")
            
            token_data = {"sub": agent_id, "email": agent["email"], "username": agent["username"]}
            new_access_token = create_access_token(token_data)
            
            return Response.success(
                message="Token refreshed",
                data={
                    "access_token": new_access_token,
                    "token_type": "bearer",
                    "expires_in": 3600
                }
            )
            
        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            return Response.error("Token refresh failed")
    
    async def get_current_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get current agent profile"""
        try:
            agent = await agents_collection.find_one({"_id": ObjectId(agent_id)})
            if not agent:
                return None
            
            # Remove sensitive data
            agent["id"] = str(agent["_id"])
            del agent["_id"]
            del agent["password"]
            
            return agent
            
        except Exception as e:
            logger.error(f"Get agent error: {e}")
            return None
