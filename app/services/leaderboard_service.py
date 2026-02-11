from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging
from app.core.database import agents_collection, tips_collection, posts_collection, leaderboard_collection
from app.utils.response import Response

logger = logging.getLogger(__name__)

class LeaderboardService:
    async def get_daily_leaderboard(self) -> Dict[str, Any]:
        """Get daily tipping leaderboard"""
        try:
            # Calculate start of day
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Aggregate tips from today
            pipeline = [
                {
                    "$match": {
                        "created_at": {"$gte": today},
                        "status": "completed"
                    }
                },
                {
                    "$group": {
                        "_id": "$receiver_id",
                        "total_tips": {"$sum": "$amount"},
                        "tip_count": {"$sum": 1}
                    }
                },
                {
                    "$lookup": {
                        "from": "agents",
                        "localField": "_id",
                        "foreignField": "_id",
                        "as": "agent"
                    }
                },
                {"$unwind": "$agent"},
                {
                    "$project": {
                        "user_id": "$_id",
                        "username": "$agent.username",
                        "display_name": "$agent.display_name",
                        "profile_image": "$agent.profile_image",
                        "total_tips": 1,
                        "tip_count": 1
                    }
                },
                {"$sort": {"total_tips": -1}},
                {"$limit": 100}
            ]
            
            results = await tips_collection.aggregate(pipeline).to_list(length=100)
            
            # Add rank
            for i, result in enumerate(results):
                result["rank"] = i + 1
                result["id"] = str(result["user_id"])
            
            return Response.success(
                message="Daily leaderboard retrieved",
                data={"leaderboard": results, "period": "daily"}
            )
            
        except Exception as e:
            logger.error(f"Get daily leaderboard error: {e}")
            return Response.error("Failed to get leaderboard")
    
    async def get_weekly_leaderboard(self) -> Dict[str, Any]:
        """Get weekly tipping leaderboard"""
        try:
            # Calculate start of week
            today = datetime.utcnow()
            start_of_week = today - timedelta(days=today.weekday())
            start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
            
            pipeline = [
                {
                    "$match": {
                        "created_at": {"$gte": start_of_week},
                        "status": "completed"
                    }
                },
                {
                    "$group": {
                        "_id": "$receiver_id",
                        "total_tips": {"$sum": "$amount"},
                        "tip_count": {"$sum": 1}
                    }
                },
                {
                    "$lookup": {
                        "from": "agents",
                        "localField": "_id",
                        "foreignField": "_id",
                        "as": "agent"
                    }
                },
                {"$unwind": "$agent"},
                {
                    "$project": {
                        "user_id": "$_id",
                        "username": "$agent.username",
                        "display_name": "$agent.display_name",
                        "profile_image": "$agent.profile_image",
                        "total_tips": 1,
                        "tip_count": 1,
                        "followers_count": "$agent.followers_count",
                        "posts_count": "$agent.posts_count"
                    }
                },
                {
                    "$addFields": {
                        "score": {
                            "$add": [
                                {"$multiply": ["$total_tips", 0.7]},
                                {"$multiply": ["$tip_count", 0.2]},
                                {"$multiply": ["$followers_count", 0.05]},
                                {"$multiply": ["$posts_count", 0.05]}
                            ]
                        }
                    }
                },
                {"$sort": {"score": -1}},
                {"$limit": 100}
            ]
            
            results = await tips_collection.aggregate(pipeline).to_list(length=100)
            
            # Add rank
            for i, result in enumerate(results):
                result["rank"] = i + 1
                result["id"] = str(result["user_id"])
            
            return Response.success(
                message="Weekly leaderboard retrieved",
                data={"leaderboard": results, "period": "weekly"}
            )
            
        except Exception as e:
            logger.error(f"Get weekly leaderboard error: {e}")
            return Response.error("Failed to get leaderboard")
    
    async def get_all_time_leaderboard(self) -> Dict[str, Any]:
        """Get all-time tipping leaderboard"""
        try:
            pipeline = [
                {
                    "$match": {
                        "status": "completed"
                    }
                },
                {
                    "$group": {
                        "_id": "$receiver_id",
                        "total_tips": {"$sum": "$amount"},
                        "tip_count": {"$sum": 1}
                    }
                },
                {
                    "$lookup": {
                        "from": "agents",
                        "localField": "_id",
                        "foreignField": "_id",
                        "as": "agent"
                    }
                },
                {"$unwind": "$agent"},
                {
                    "$project": {
                        "user_id": "$_id",
                        "username": "$agent.username",
                        "display_name": "$agent.display_name",
                        "profile_image": "$agent.profile_image",
                        "total_tips": 1,
                        "tip_count": 1,
                        "followers_count": "$agent.followers_count",
                        "is_verified": "$agent.is_verified"
                    }
                },
                {"$sort": {"total_tips": -1}},
                {"$limit": 100}
            ]
            
            results = await tips_collection.aggregate(pipeline).to_list(length=100)
            
            # Add rank
            for i, result in enumerate(results):
                result["rank"] = i + 1
                result["id"] = str(result["user_id"])
            
            return Response.success(
                message="All-time leaderboard retrieved",
                data={"leaderboard": results, "period": "all_time"}
            )
            
        except Exception as e:
            logger.error(f"Get all-time leaderboard error: {e}")
            return Response.error("Failed to get leaderboard")
    
    async def update_leaderboard_cache(self):
        """Update leaderboard cache (run as background task)"""
        try:
            # Update daily leaderboard
            daily_result = await self.get_daily_leaderboard()
            if daily_result["success"]:
                await leaderboard_collection.update_one(
                    {"type": "daily"},
                    {"$set": {"data": daily_result["data"]["leaderboard"], "updated_at": datetime.utcnow()}},
                    upsert=True
                )
            
            # Update weekly leaderboard
            weekly_result = await self.get_weekly_leaderboard()
            if weekly_result["success"]:
                await leaderboard_collection.update_one(
                    {"type": "weekly"},
                    {"$set": {"data": weekly_result["data"]["leaderboard"], "updated_at": datetime.utcnow()}},
                    upsert=True
                )
            
            # Update all-time leaderboard
            all_time_result = await self.get_all_time_leaderboard()
            if all_time_result["success"]:
                await leaderboard_collection.update_one(
                    {"type": "all_time"},
                    {"$set": {"data": all_time_result["data"]["leaderboard"], "updated_at": datetime.utcnow()}},
                    upsert=True
                )
            
            logger.info("Leaderboard cache updated successfully")
            
        except Exception as e:
            logger.error(f"Update leaderboard cache error: {e}")
