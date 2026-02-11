import logging
from typing import Dict, Any
from datetime import datetime
from bson import ObjectId

from app.core.database import db
from app.services.blockchain_service import blockchain_service

logger = logging.getLogger(__name__)


class WalletService:

    @staticmethod
    async def verify_wallet_ownership(wallet_address: str, signature: str, message: str) -> bool:
        """Verify wallet ownership using signature"""
        try:
            recovered_address = blockchain_service.recover_address(message, signature)
            return recovered_address.lower() == wallet_address.lower()
        except Exception as e:
            logger.error(f"Wallet verification error: {e}")
            return False

    @staticmethod
    async def get_wallet_stats(wallet_address: str) -> Dict[str, Any]:
        """Get wallet statistics"""
        try:
            wallet_address = wallet_address.lower()

            agent = await db.database.agents.find_one({"walletAddress": wallet_address})

            if not agent:
                return {"success": False, "error": "Agent not found"}

            # Get blockchain balance
            balance_result = await blockchain_service.get_balance(wallet_address)
            if not balance_result or not balance_result.get("success"):
                balance_result = None

            # Tips received stats
            tips_received = await db.database.tips.aggregate([
                {"$match": {"toAddress": wallet_address, "status": "confirmed"}},
                {"$group": {
                    "_id": None,
                    "totalAmount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }}
            ]).to_list(length=1)

            # Tips given stats
            tips_given = await db.database.tips.aggregate([
                {"$match": {"fromAddress": wallet_address, "status": "confirmed"}},
                {"$group": {
                    "_id": None,
                    "totalAmount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }}
            ]).to_list(length=1)

            # Recent tips activity
            recent_tips = await db.database.tips.find({
                "$or": [
                    {"fromAddress": wallet_address},
                    {"toAddress": wallet_address}
                ],
                "status": "confirmed"
            }).sort("createdAt", -1).limit(10).to_list(length=10)

            return {
                "success": True,
                "walletAddress": wallet_address,
                "agent": {
                    "id": str(agent["_id"]),
                    "username": agent.get("username"),
                    "reputationScore": agent.get("reputationScore", 0),
                    "stakedTokens": agent.get("stakedTokens", 0),
                    "totalTipsReceived": agent.get("totalTipsReceived", 0),
                    "totalTipsGiven": agent.get("totalTipsGiven", 0),
                },
                "balance": balance_result,
                "tipsReceived": tips_received[0] if tips_received else {"totalAmount": 0, "count": 0},
                "tipsGiven": tips_given[0] if tips_given else {"totalAmount": 0, "count": 0},
                "recentTips": recent_tips
            }

        except Exception as e:
            logger.error(f"Wallet stats error: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    async def update_wallet_balance(agent_id: str, amount: float, is_stake: bool = True) -> bool:
        """Update agent staked token balance"""
        try:
            if amount <= 0:
                return False

            inc_value = amount if is_stake else -amount

            result = await db.database.agents.update_one(
                {"_id": ObjectId(agent_id)},
                {"$inc": {"stakedTokens": inc_value},
                 "$set": {"updatedAt": datetime.utcnow()}}
            )

            return result.modified_count > 0

        except Exception as e:
            logger.error(f"Update wallet balance error: {e}")
            return False

    @staticmethod
    async def get_wallet_activity(wallet_address: str, limit: int = 50) -> Dict[str, Any]:
        """Get wallet activity including tips"""
        try:
            wallet_address = wallet_address.lower()

            tips_sent = await db.database.tips.find(
                {"fromAddress": wallet_address}
            ).sort("createdAt", -1).limit(limit).to_list(length=limit)

            tips_received = await db.database.tips.find(
                {"toAddress": wallet_address}
            ).sort("createdAt", -1).limit(limit).to_list(length=limit)

            all_activity = tips_sent + tips_received
            all_activity.sort(
                key=lambda x: x.get("createdAt", datetime.min),
                reverse=True
            )

            return {
                "success": True,
                "walletAddress": wallet_address,
                "activity": all_activity[:limit],
                "sentCount": len(tips_sent),
                "receivedCount": len(tips_received)
            }

        except Exception as e:
            logger.error(f"Wallet activity error: {e}")
            return {"success": False, "error": str(e)}


wallet_service = WalletService()
