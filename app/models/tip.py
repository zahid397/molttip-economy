from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class TipStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Tip(Base):
    __tablename__ = "tips"

    id = Column(Integer, primary_key=True, index=True)

    from_agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    to_agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)

    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    amount = Column(Float, nullable=False)
    token_symbol = Column(String(20), default="ETH", nullable=False)

    transaction_hash = Column(String(100), unique=True, index=True, nullable=True)

    status = Column(Enum(TipStatus), default=TipStatus.PENDING, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    from_agent = relationship(
        "Agent",
        foreign_keys=[from_agent_id],
        back_populates="sent_tips"
    )

    to_agent = relationship(
        "Agent",
        foreign_keys=[to_agent_id],
        back_populates="received_tips"
    )

    post = relationship("Post", back_populates="tips")
    comment = relationship("Comment", back_populates="tips")

    def __repr__(self):
        return f"<Tip(id={self.id}, amount={self.amount}, status={self.status})>"
