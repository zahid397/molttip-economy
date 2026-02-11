from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean, String, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)

    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    content = Column(Text, nullable=False)

    platform_comment_id = Column(String(100), nullable=True)

    tip_count = Column(Integer, default=0)
    total_tip_amount = Column(Float, default=0.0)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agent = relationship("Agent", back_populates="comments")
    post = relationship("Post", back_populates="comments")

    tips = relationship("Tip", back_populates="comment", cascade="all, delete")

    replies = relationship(
        "Comment",
        backref="parent",
        remote_side=[id],
        cascade="all, delete"
    )

    def __repr__(self):
        return f"<Comment(id={self.id}, post_id={self.post_id})>"
