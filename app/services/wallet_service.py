from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import logging
from decimal import Decimal
from app.core.database import agents_collection, transactions_collection, get_async_collection
from app.utils.response import Response
from app.services.notification_service import NotificationService
from app.services.blockchain_service import BlockchainService

logger = logging.getLogger(__name__)

class WalletService:
    def __init__(self):
        self.notification_service = NotificationService()
        self.blockchain_service = BlockchainService()
    
    async def get_balance(self, agent_id: str) -> Dict[str, Any]:
        """Get wallet balance"""
        try:
            agent = await agents_collection.find_one({"_id": ObjectId(agent_id)})
            if not agent:
                return Response.error("Agent not found")
            
            return Response.success(
                message="Balance retrieved",
                data={
                    "balance": agent.get("wallet_balance", 0),
                    "currency": "MOLT",
                    "address": agent.get("wallet_address"),
                    "total_received": agent.get("total_tips_received", 0),
                    "total_sent": agent.get("total_tips_sent", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Get balance error: {e}")
            return Response.error("Failed to get balance")
    
    async def add_funds(self, agent_id: str, amount: float, method: str = "deposit") -> Dict[str, Any]:
        """Add funds to wallet"""
        try:
            if amount <= 0:
                return Response.error("Amount must be greater than 0")
            
            result = await agents_collection.update_one(
                {"_id": ObjectId(agent_id)},
                {"$inc": {"wallet_balance": amount}}
            )
            
            if result.modified_count == 0:
                return Response.error("Failed to add funds")
            
            # Record transaction
            transaction = {
                "agent_id": agent_id,
                "type": "deposit",
                "amount": amount,
                "currency": "MOLT",
                "method": method,
                "status": "completed",
                "created_at": datetime.utcnow()
            }
            await transactions_collection.insert_one(transaction)
            
            return Response.success(
                message="Funds added successfully",
                data={"new_balance": await self._get_current_balance(agent_id)}
            )
            
        except Exception as e:
            logger.error(f"Add funds error: {e}")
            return Response.error("Failed to add funds")
    
    async def send_tip(self, sender_id: str, receiver_id: str, amount: float, 
                      message: str = "", target_type: str = "user", target_id: str = None) -> Dict[str, Any]:
        """Send tip from one user to another"""
        try:
            if sender_id == receiver_id:
                return Response.error("Cannot tip yourself")
            
            if amount <= 0:
                return Response.error("Amount must be greater than 0")
            
            # Check sender balance
            sender = await agents_collection.find_one({"_id": ObjectId(sender_id)})
            if not sender:
                return Response.error("Sender not found")
            
            if sender.get("wallet_balance", 0) < amount:
                return Response.error("Insufficient balance")
            
            receiver = await agents_collection.find_one({"_id": ObjectId(receiver_id)})
            if not receiver:
                return Response.error("Receiver not found")
            
            # Start transaction
            session = await agents_collection.database.client.start_session()
            
            try:
                async with session.start_transaction():
                    # Deduct from sender
                    await agents_collection.update_one(
                        {"_id": ObjectId(sender_id)},
                        {"$inc": {"wallet_balance": -amount, "total_tips_sent": amount}},
                        session=session
                    )
                    
                    # Add to receiver
                    await agents_collection.update_one(
                        {"_id": ObjectId(receiver_id)},
                        {"$inc": {"wallet_balance": amount, "total_tips_received": amount}},
                        session=session
                    )
                    
                    # Record tip
                    tip_data = {
                        "sender_id": sender_id,
                        "receiver_id": receiver_id,
                        "amount": amount,
                        "currency": "MOLT",
                        "type": target_type,
                        "target_id": target_id,
                        "message": message,
                        "status": "completed",
                        "created_at": datetime.utcnow()
                    }
                    
                    tips_collection = await get_async_collection("tips")
                    tip_result = await tips_collection.insert_one(tip_data, session=session)
                    tip_id = str(tip_result.inserted_id)
                    
                    # Create transaction record
                    transaction = {
                        "sender_id": sender_id,
                        "receiver_id": receiver_id,
                        "type": "tip",
                        "amount": amount,
                        "currency": "MOLT",
                        "tip_id": tip_id,
                        "status": "completed",
                        "created_at": datetime.utcnow()
                    }
                    await transactions_collection.insert_one(transaction, session=session)
                    
                    # Send notification to receiver
                    await self.notification_service.create_notification(
                        user_id=receiver_id,
                        type="tip_received",
                        title="💰 New Tip Received!",
                        message=f"{sender.get('display_name', sender['username'])} sent you {amount} MOLT",
                        data={"tip_id": tip_id, "amount": amount, "sender_id": sender_id},
                        related_user_id=sender_id,
                        related_tip_id=tip_id
                    )
                    
            except Exception as e:
                await session.abort_transaction()
                raise e
            
            return Response.success(
                message="Tip sent successfully",
                data={
                    "tip_id": tip_id,
                    "amount": amount,
                    "sender_balance": await self._get_current_balance(sender_id),
                    "receiver_balance": await self._get_current_balance(receiver_id)
                }
            )
            
        except Exception as e:
            logger.error(f"Send tip error: {e}")
            return Response.error("Failed to send tip")
    
    async def get_transaction_history(self, agent_id: str, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get transaction history"""
        try:
            skip = (page - 1) * limit
            
            # Get transactions where agent is sender or receiver
            query = {
                "$or": [
                    {"sender_id": agent_id},
                    {"receiver_id": agent_id}
                ]
            }
            
            total = await transactions_collection.count_documents(query)
            transactions = await transactions_collection.find(query) \
                .sort("created_at", -1) \
                .skip(skip) \
                .limit(limit) \
                .to_list(length=limit)
            
            # Convert ObjectId to string
            for tx in transactions:
                tx["id"] = str(tx["_id"])
                del tx["_id"]
            
            return Response.success(
                message="Transactions retrieved",
                data={
                    "transactions": transactions,
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "pages": (total + limit - 1) // limit
                }
            )
            
        except Exception as e:
            logger.error(f"Get transactions error: {e}")
            return Response.error("Failed to get transactions")
    
    async def _get_current_balance(self, agent_id: str) -> float:
        """Get current balance helper"""
        agent = await agents_collection.find_one({"_id": ObjectId(agent_id)})
        return agent.get("wallet_balance", 0) if agent else 0
