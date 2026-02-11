from typing import Dict, Any
from datetime import datetime, timedelta
import logging
from app.core.database import agents_collection, posts_collection, tips_collection, comments_collection
from app.utils.response import Response

logger = logging.getLogger(__name__)

class AnalyticsService:
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        try:
            # Get today's date
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            
            # Total users
            total_users = await agents_collection.count_documents({})
            
            # New users today
            new_users_today = await agents_collection.count_documents({
                "created_at": {"$gte": today}
            })
            
            # Total posts
            total_posts = await posts_collection.count_documents({})
            
            # Posts today
            posts_today = await posts_collection.count_documents({
                "created_at": {"$gte": today}
            })
            
            # Total tips
            total_tips = await tips_collection.count_documents({})
            
            # Tips today
            tips_today_result = await tips_collection.aggregate([
                {"$match": {"created_at": {"$gte": today}}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]).to_list(length=1)
            tips_today = tips_today_result[0]["total"] if tips_today_result else 0
            
            # Total tips amount
            total_tips_amount_result = await tips_collection.aggregate([
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]).to_list(length=1)
            total_tips_amount = total_tips_amount_result[0]["total"] if total_tips_amount_result else 0
            
            # Daily active users (users who performed any action today)
            daily_active_users = await tips_collection.distinct("sender_id", {"created_at": {"$gte": today}})
            daily_active_users = len(set(daily_active_users))
            
            # Top tippers today
            top_tippers = await tips_collection.aggregate([
                {"$match": {"created_at": {"$gte": yesterday}}},
                {"$group": {"_id": "$sender_id", "total": {"$sum": "$amount"}}},
                {"$sort": {"total": -1}},
                {"$limit": 10},
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
                        "total_tips": "$total"
                    }
                }
            ]).to_list(length=10)
            
            # Top creators today (by tips received)
            top_creators = await tips_collection.aggregate([
                {"$match": {"created_at": {"$gte": yesterday}}},
                {"$group": {"_id": "$receiver_id", "total": {"$sum": "$amount"}}},
                {"$sort": {"total": -1}},
                {"$limit": 10},
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
                        "total_received": "$total"
                    }
                }
            ]).to_list(length=10)
            
            # Trending posts (based on tips and engagement)
            trending_posts = await posts_collection.aggregate([
                {"$match": {"created_at": {"$gte": yesterday}}},
                {
                    "$lookup": {
                        "from": "tips",
                        "localField": "_id",
                        "foreignField": "target_id",
                        "as": "post_tips"
                    }
                },
                {
                    "$lookup": {
                        "from": "comments",
                        "localField": "_id",
                        "foreignField": "post_id",
                        "as": "post_comments"
                    }
                },
                {
                    "$addFields": {
                        "tip_count": {"$size": "$post_tips"},
                        "tip_total": {"$sum": "$post_tips.amount"},
                        "comment_count": {"$size": "$post_comments"},
                        "score": {
                            "$add": [
                                {"$multiply": [{"$size": "$post_tips"}, 5]},
                                {"$multiply": [{"$sum": "$post_tips.amount"}, 2]},
                                {"$multiply": [{"$size": "$post_comments"}, 3]}
                            ]
                        }
                    }
                },
                {"$sort": {"score": -1}},
                {"$limit": 10},
                {
                    "$lookup": {
                        "from": "agents",
                        "localField": "user_id",
                        "foreignField": "_id",
                        "as": "author"
                    }
                },
                {"$unwind": "$author"},
                {
                    "$project": {
                        "id": "$_id",
                        "content": "$content",
                        "author_username": "$author.username",
                        "author_display_name": "$author.display_name",
                        "tip_count": 1,
                        "tip_total": 1,
                        "comment_count": 1,
                        "score": 1,
                        "created_at": 1
                    }
                }
            ]).to_list(length=10)
            
            return Response.success(
                message="Dashboard stats retrieved",
                data={
                    "total_users": total_users,
                    "new_users_today": new_users_today,
                    "total_posts": total_posts,
                    "posts_today": posts_today,
                    "total_tips": total_tips,
                    "tips_today": tips_today,
                    "total_transactions": total_tips_amount,
                    "daily_active_users": daily_active_users,
                    "top_tippers": top_tippers,
                    "top_creators": top_creators,
                    "trending_posts": trending_posts
                }
            )
            
        except Exception as e:
            logger.error(f"Get dashboard stats error: {e}")
            return Response.error("Failed to get dashboard stats")
    
    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics for a specific user"""
        try:
            # Get user's posts
            user_posts = await posts_collection.find({"user_id": user_id}).to_list(length=100)
            
            # Calculate post engagement
            post_ids = [post["_id"] for post in user_posts]
            
            # Get tips for user's posts
            post_tips = await tips_collection.aggregate([
                {"$match": {"target_id": {"$in": post_ids}, "type": "post"}},
                {"$group": {"_id": "$target_id", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
            ]).to_list(length=100)
            
            # Get comments for user's posts
            post_comments = await comments_collection.aggregate([
                {"$match": {"post_id": {"$in": post_ids}}},
                {"$group": {"_id": "$post_id", "count": {"$sum": 1}}}
            ]).to_list(length=100)
            
            # Convert to dictionaries for easier lookup
            tips_dict = {str(tip["_id"]): tip for tip in post_tips}
            comments_dict = {str(comment["_id"]): comment for comment in post_comments}
            
            # Calculate engagement metrics per post
            post_metrics = []
            for post in user_posts:
                post_id = str(post["_id"])
                tip_data = tips_dict.get(post_id, {"total": 0, "count": 0})
                comment_data = comments_dict.get(post_id, {"count": 0})
                
                post_metrics.append({
                    "post_id": post_id,
                    "content_preview": post["content"][:100] + "..." if len(post["content"]) > 100 else post["content"],
                    "tip_total": tip_data["total"],
                    "tip_count": tip_data["count"],
                    "comment_count": comment_data["count"],
                    "created_at": post["created_at"]
                })
            
            # Get user's tipping history
            user_tips_sent = await tips_collection.aggregate([
                {"$match": {"sender_id": user_id}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}},
                {"$limit": 30}
            ]).to_list(length=30)
            
            user_tips_received = await tips_collection.aggregate([
                {"$match": {"receiver_id": user_id}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}},
                {"$limit": 30}
            ]).to_list(length=30)
            
            # Calculate follower growth (simplified)
            user_data = await agents_collection.find_one({"_id": user_id})
            followers_count = user_data.get("followers_count", 0) if user_data else 0
            
            return Response.success(
                message="User analytics retrieved",
                data={
                    "post_metrics": post_metrics,
                    "tips_sent_timeline": user_tips_sent,
                    "tips_received_timeline": user_tips_received,
                    "followers_count": followers_count,
                    "total_posts": len(user_posts),
                    "total_tips_sent": sum(tip["total"] for tip in user_tips_sent),
                    "total_tips_received": sum(tip["total"] for tip in user_tips_received)
                }
            )
            
        except Exception as e:
            logger.error(f"Get user analytics error: {e}")
            return Response.error("Failed to get user analytics")
