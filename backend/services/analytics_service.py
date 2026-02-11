import logging
from typing import Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId

from app.core.database import db
from app.services.leaderboard_service import leaderboard_service

logger = logging.getLogger(__name__)


class AnalyticsService:

    @staticmethod
    async def get_overall_stats() -> Dict[str, Any]:
        """Get overall platform statistics"""
        try:
            total_agents = await db.database.agents.count_documents({})
            total_posts_count = await db.database.posts.count_documents({})
            total_tips = await db.database.tips.count_documents({"status": "confirmed"})

            # Total volume
            volume_result = await db.database.tips.aggregate([
                {"$match": {"status": "confirmed"}},
                {"$group": {"_id": None, "totalVolume": {"$sum": "$amount"}}}
            ]).to_list(length=1)

            total_volume = float(volume_result[0]["totalVolume"]) if volume_result else 0.0

            daily_stats = await AnalyticsService.get_daily_stats()

            top_agents = await leaderboard_service.get_top_agents_by_tips(limit=10)
            top_posts = await leaderboard_service.get_top_posts_by_tips(limit=10)

            return {
                "success": True,
                "totalAgents": total_agents,
                "totalPosts": total_posts_count,
                "totalTips": total_tips,
                "totalVolume": total_volume,
                "dailyStats": daily_stats,
                "topAgents": top_agents,
                "topPosts": top_posts,
                "updatedAt": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Overall stats error: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    async def get_daily_stats(days: int = 30) -> Dict[str, Any]:
        """Get daily statistics for last N days"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            # Tips stats
            daily_tips_pipeline = [
                {"$match": {
                    "status": "confirmed",
                    "confirmedAt": {"$gte": start_date, "$lte": end_date}
                }},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$confirmedAt"}},
                    "tipCount": {"$sum": 1},
                    "totalAmount": {"$sum": "$amount"}
                }},
                {"$sort": {"_id": 1}}
            ]

            daily_tips = await db.database.tips.aggregate(daily_tips_pipeline).to_list(length=None)

            # Posts stats
            daily_posts_pipeline = [
                {"$match": {"createdAt": {"$gte": start_date, "$lte": end_date}}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                    "postCount": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]

            daily_posts = await db.database.posts.aggregate(daily_posts_pipeline).to_list(length=None)

            # Agents stats
            daily_agents_pipeline = [
                {"$match": {"createdAt": {"$gte": start_date, "$lte": end_date}}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                    "agentCount": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]

            daily_agents = await db.database.agents.aggregate(daily_agents_pipeline).to_list(length=None)

            # Convert to dict
            daily_tips_dict = {item["_id"]: item for item in daily_tips}
            daily_posts_dict = {item["_id"]: item for item in daily_posts}
            daily_agents_dict = {item["_id"]: item for item in daily_agents}

            daily_data = []
            current_date = start_date

            while current_date <= end_date:
                date_str = current_date.strftime("%Y-%m-%d")

                tips_item = daily_tips_dict.get(date_str, {"tipCount": 0, "totalAmount": 0})
                posts_item = daily_posts_dict.get(date_str, {"postCount": 0})
                agents_item = daily_agents_dict.get(date_str, {"agentCount": 0})

                daily_data.append({
                    "date": date_str,
                    "tipCount": tips_item.get("tipCount", 0),
                    "tipVolume": float(tips_item.get("totalAmount", 0)),
                    "postCount": posts_item.get("postCount", 0),
                    "agentCount": agents_item.get("agentCount", 0)
                })

                current_date += timedelta(days=1)

            # Summary
            total_daily_tips = sum(item["tipCount"] for item in daily_data)
            total_daily_volume = sum(item["tipVolume"] for item in daily_data)
            total_daily_posts = sum(item["postCount"] for item in daily_data)
            total_daily_agents = sum(item["agentCount"] for item in daily_data)

            return {
                "periodDays": days,
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat(),
                "dailyData": daily_data,
                "summary": {
                    "totalTips": total_daily_tips,
                    "totalVolume": total_daily_volume,
                    "totalPosts": total_daily_posts,
                    "totalAgents": total_daily_agents,
                    "avgTipsPerDay": round(total_daily_tips / days, 2) if days else 0,
                    "avgVolumePerDay": round(total_daily_volume / days, 2) if days else 0,
                    "avgPostsPerDay": round(total_daily_posts / days, 2) if days else 0
                }
            }

        except Exception as e:
            logger.error(f"Daily stats error: {e}")
            return {"error": str(e)}

    @staticmethod
    async def get_agent_analytics(agent_id: str) -> Dict[str, Any]:
        """Get analytics for a specific agent"""
        try:
            if not ObjectId.is_valid(agent_id):
                return {"success": False, "error": "Invalid agent_id format"}

            agent_obj_id = ObjectId(agent_id)

            agent = await db.database.agents.find_one({"_id": agent_obj_id})

            if not agent:
                return {"success": False, "error": "Agent not found"}

            wallet_address = agent.get("walletAddress", "").lower()

            # Tips received stats
            tips_received_stats = await db.database.tips.aggregate([
                {"$match": {"toAddress": wallet_address, "status": "confirmed"}},
                {"$group": {
                    "_id": None,
                    "totalAmount": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                    "avgAmount": {"$avg": "$amount"}
                }}
            ]).to_list(length=1)

            # Tips given stats
            tips_given_stats = await db.database.tips.aggregate([
                {"$match": {"fromAddress": wallet_address, "status": "confirmed"}},
                {"$group": {
                    "_id": None,
                    "totalAmount": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                    "avgAmount": {"$avg": "$amount"}
                }}
            ]).to_list(length=1)

            # Post stats
            post_stats = await db.database.posts.aggregate([
                {"$match": {"agentId": agent_id}},
                {"$group": {
                    "_id": None,
                    "totalPosts": {"$sum": 1},
                    "totalTips": {"$sum": "$tipAmount"},
                    "totalTipCount": {"$sum": "$tipCount"},
                    "totalViews": {"$sum": "$viewCount"},
                    "totalLikes": {"$sum": "$likeCount"},
                    "totalComments": {"$sum": "$commentCount"},
                    "avgTipsPerPost": {"$avg": "$tipAmount"}
                }}
            ]).to_list(length=1)

            recent_tips = await db.database.tips.find({
                "$or": [
                    {"fromAddress": wallet_address},
                    {"toAddress": wallet_address}
                ],
                "status": "confirmed"
            }).sort("createdAt", -1).limit(20).to_list(length=20)

            recent_posts = await db.database.posts.find(
                {"agentId": agent_id}
            ).sort("createdAt", -1).limit(10).to_list(length=10)

            rank_data = await leaderboard_service.get_agent_rank(agent_id)

            return {
                "success": True,
                "agent": {
                    "id": str(agent["_id"]),
                    "username": agent.get("username"),
                    "walletAddress": wallet_address,
                    "reputationScore": agent.get("reputationScore", 0),
                    "createdAt": agent.get("createdAt")
                },
                "tipsReceived": tips_received_stats[0] if tips_received_stats else {
                    "totalAmount": 0, "count": 0, "avgAmount": 0
                },
                "tipsGiven": tips_given_stats[0] if tips_given_stats else {
                    "totalAmount": 0, "count": 0, "avgAmount": 0
                },
                "posts": post_stats[0] if post_stats else {
                    "totalPosts": 0,
                    "totalTips": 0,
                    "totalTipCount": 0,
                    "totalViews": 0,
                    "totalLikes": 0,
                    "totalComments": 0,
                    "avgTipsPerPost": 0
                },
                "recentActivity": {
                    "tips": recent_tips,
                    "posts": recent_posts
                },
                "rank": rank_data,
                "updatedAt": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Agent analytics error: {e}")
            return {"success": False, "error": str(e)}


analytics_service = AnalyticsService()
