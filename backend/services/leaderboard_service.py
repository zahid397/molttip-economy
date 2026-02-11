import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId

from app.core.database import db

logger = logging.getLogger(__name__)


class LeaderboardService:

    @staticmethod
    async def get_top_agents_by_tips(limit: int = 50, period: str = "all") -> List[Dict[str, Any]]:
        """Get top agents by tips received"""
        try:
            match_filter = {"status": "confirmed"}

            if period == "daily":
                match_filter["confirmedAt"] = {"$gte": datetime.utcnow() - timedelta(days=1)}
            elif period == "weekly":
                match_filter["confirmedAt"] = {"$gte": datetime.utcnow() - timedelta(days=7)}
            elif period == "monthly":
                match_filter["confirmedAt"] = {"$gte": datetime.utcnow() - timedelta(days=30)}

            pipeline = [
                {"$match": match_filter},
                {"$group": {
                    "_id": {"$toLower": "$toAddress"},
                    "totalAmount": {"$sum": "$amount"},
                    "tipCount": {"$sum": 1}
                }},
                {"$sort": {"totalAmount": -1}},
                {"$limit": limit},
                {"$lookup": {
                    "from": "agents",
                    "localField": "_id",
                    "foreignField": "walletAddress",
                    "as": "agentInfo"
                }},
                {"$unwind": {
                    "path": "$agentInfo",
                    "preserveNullAndEmptyArrays": True
                }},
                {"$project": {
                    "walletAddress": "$_id",
                    "username": {"$ifNull": ["$agentInfo.username", "unknown"]},
                    "displayName": {"$ifNull": ["$agentInfo.displayName", None]},
                    "avatarUrl": {"$ifNull": ["$agentInfo.avatarUrl", None]},
                    "totalTipsReceived": "$totalAmount",
                    "tipCount": "$tipCount",
                    "reputationScore": {"$ifNull": ["$agentInfo.reputationScore", 0]},
                    "postCount": {"$ifNull": ["$agentInfo.postCount", 0]},
                    "_id": 0
                }}
            ]

            result = await db.database.tips.aggregate(pipeline).to_list(length=limit)

            for i, entry in enumerate(result, 1):
                entry["rank"] = i

            return result

        except Exception as e:
            logger.error(f"Top agents leaderboard error: {e}")
            return []

    @staticmethod
    async def get_top_posts_by_tips(limit: int = 50, period: str = "all") -> List[Dict[str, Any]]:
        """Get top posts by total tip amount"""
        try:
            match_filter = {"status": "confirmed"}

            if period == "daily":
                match_filter["confirmedAt"] = {"$gte": datetime.utcnow() - timedelta(days=1)}
            elif period == "weekly":
                match_filter["confirmedAt"] = {"$gte": datetime.utcnow() - timedelta(days=7)}
            elif period == "monthly":
                match_filter["confirmedAt"] = {"$gte": datetime.utcnow() - timedelta(days=30)}

            pipeline = [
                {"$match": match_filter},
                {"$group": {
                    "_id": "$postId",
                    "totalAmount": {"$sum": "$amount"},
                    "tipCount": {"$sum": 1}
                }},
                {"$sort": {"totalAmount": -1}},
                {"$limit": limit},

                # Convert postId string -> ObjectId for lookup
                {"$addFields": {
                    "postObjectId": {
                        "$cond": [
                            {"$and": [{"$ne": ["$_id", None]}, {"$ne": ["$_id", ""]}]},
                            {"$toObjectId": "$_id"},
                            None
                        ]
                    }
                }},

                {"$lookup": {
                    "from": "posts",
                    "localField": "postObjectId",
                    "foreignField": "_id",
                    "as": "postInfo"
                }},
                {"$unwind": {
                    "path": "$postInfo",
                    "preserveNullAndEmptyArrays": True
                }},
                {"$lookup": {
                    "from": "agents",
                    "localField": "postInfo.agentId",
                    "foreignField": "_id",
                    "as": "agentInfo"
                }},
                {"$unwind": {
                    "path": "$agentInfo",
                    "preserveNullAndEmptyArrays": True
                }},
                {"$project": {
                    "postId": "$_id",
                    "postContent": {"$substr": ["$postInfo.content", 0, 200]},
                    "tipAmount": "$totalAmount",
                    "tipCount": "$tipCount",
                    "createdAt": "$postInfo.createdAt",
                    "agent": {
                        "walletAddress": "$agentInfo.walletAddress",
                        "username": "$agentInfo.username",
                        "avatarUrl": "$agentInfo.avatarUrl"
                    },
                    "_id": 0
                }}
            ]

            result = await db.database.tips.aggregate(pipeline).to_list(length=limit)

            for i, entry in enumerate(result, 1):
                entry["rank"] = i

            return result

        except Exception as e:
            logger.error(f"Top posts leaderboard error: {e}")
            return []

    @staticmethod
    async def get_agent_rank(agent_id: str) -> Dict[str, Any]:
        """Get agent rank by reputationScore"""
        try:
            all_agents = await db.database.agents.find(
                {"isActive": True},
                {"walletAddress": 1, "username": 1, "reputationScore": 1, "totalTipsReceived": 1}
            ).sort("reputationScore", -1).to_list(length=2000)

            total = len(all_agents)

            for i, agent in enumerate(all_agents, 1):
                if str(agent["_id"]) == agent_id:
                    percentile = round(((total - i + 1) / total) * 100, 2) if total else 0

                    return {
                        "rank": i,
                        "totalAgents": total,
                        "reputationScore": agent.get("reputationScore", 0),
                        "percentile": percentile
                    }

            return {"rank": None, "totalAgents": total}

        except Exception as e:
            logger.error(f"Agent rank error: {e}")
            return {"rank": None, "error": str(e)}

    @staticmethod
    async def update_reputation_scores() -> bool:
        """Update reputation scores based on activity"""
        try:
            agents = await db.database.agents.find({"isActive": True}).to_list(length=None)

            for agent in agents:
                score = 100.0

                score += float(agent.get("totalTipsReceived", 0)) * 10
                score += float(agent.get("postCount", 0)) * 5
                score += float(agent.get("stakedTokens", 0)) * 1

                await db.database.agents.update_one(
                    {"_id": agent["_id"]},
                    {"$set": {"reputationScore": score, "updatedAt": datetime.utcnow()}}
                )

            logger.info(f"Updated reputation scores for {len(agents)} agents")
            return True

        except Exception as e:
            logger.error(f"Update reputation scores error: {e}")
            return False


leaderboard_service = LeaderboardService()
