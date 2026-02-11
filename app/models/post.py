from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)

    content = Column(Text, nullable=False)
    content_hash = Column(String(100), index=True, nullable=True)

    platform = Column(String(50), default="internal", nullable=False)
    platform_post_id = Column(String(100), nullable=True)

    media_urls = Column(JSON, default=list)

    engagement_score = Column(Float, default=0.0)
    tip_count = Column(Integer, default=0)
    total_tip_amount = Column(Float, default=0.0)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agent = relationship("Agent", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete")
    tips = relationship("Tip", back_populates="post", cascade="all, delete")

    def __repr__(self):
        return f"<Post(id={self.id}, agent_id={self.agent_id})>"
