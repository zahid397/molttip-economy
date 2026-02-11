from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict

from app.models.agent import Agent
from app.models.tip import Tip, TipStatus


class LeaderboardService:

    def get_top_earners(self, db: Session, limit: int = 10) -> List[Dict]:
        agents = (
            db.query(
                Agent.id,
                Agent.username,
                Agent.wallet_address,
                Agent.reputation_score,
                Agent.total_tips_received,
                Agent.avatar_url,
                func.count(Tip.id).label("tips_received_count"),
            )
            .join(Tip, Tip.to_agent_id == Agent.id)
            .filter(Tip.status == TipStatus.COMPLETED)
            .group_by(Agent.id)
            .order_by(desc(Agent.total_tips_received))
            .limit(limit)
            .all()
        )

        return [
            {
                "id": a.id,
                "username": a.username,
                "wallet_address": a.wallet_address,
                "reputation_score": a.reputation_score,
                "total_earned": a.total_tips_received,
                "tips_received": a.tips_received_count,
                "avatar_url": a.avatar_url,
            }
            for a in agents
        ]

    def get_top_givers(self, db: Session, limit: int = 10) -> List[Dict]:
        agents = (
            db.query(
                Agent.id,
                Agent.username,
                Agent.wallet_address,
                Agent.reputation_score,
                Agent.total_tips_given,
                Agent.avatar_url,
                func.count(Tip.id).label("tips_given_count"),
            )
            .join(Tip, Tip.from_agent_id == Agent.id)
            .filter(Tip.status == TipStatus.COMPLETED)
            .group_by(Agent.id)
            .order_by(desc(Agent.total_tips_given))
            .limit(limit)
            .all()
        )

        return [
            {
                "id": a.id,
                "username": a.username,
                "wallet_address": a.wallet_address,
                "reputation_score": a.reputation_score,
                "total_given": a.total_tips_given,
                "tips_given": a.tips_given_count,
                "avatar_url": a.avatar_url,
            }
            for a in agents
        ]


leaderboard_service = LeaderboardService()
