from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Agent(Base):
    __tablename__ = "agents"

    # -------------------------
    # Primary Info
    # -------------------------
    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    wallet_address = Column(String(100), unique=True, index=True, nullable=True)

    # -------------------------
    # Profile Info
    # -------------------------
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # -------------------------
    # Economy Stats
    # -------------------------
    reputation_score = Column(Float, default=0.0)
    total_tips_received = Column(Float, default=0.0)
    total_tips_given = Column(Float, default=0.0)

    # -------------------------
    # Account Status
    # -------------------------
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # -------------------------
    # Timestamps
    # -------------------------
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # -------------------------
    # Relationships (Future Expandable)
    # -------------------------
    posts = relationship("Post", back_populates="agent", cascade="all, delete")
    comments = relationship("Comment", back_populates="agent", cascade="all, delete")
    sent_tips = relationship("Tip", foreign_keys="Tip.from_agent_id", cascade="all, delete")
    received_tips = relationship("Tip", foreign_keys="Tip.to_agent_id", cascade="all, delete")

    def __repr__(self):
        return f"<Agent(username={self.username}, email={self.email})>"
