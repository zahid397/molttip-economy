from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)

    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)

    metadata = Column(Text, nullable=True)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    agent = relationship("Agent")

    def __repr__(self):
        return f"<Notification(id={self.id}, agent_id={self.agent_id}, type={self.type})>"
