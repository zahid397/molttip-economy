from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class TransactionType(str, enum.Enum):
    TIP = "tip"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)

    transaction_type = Column(Enum(TransactionType), nullable=False)

    amount = Column(Float, nullable=False)
    token_symbol = Column(String(20), default="ETH", nullable=False)

    transaction_hash = Column(String(100), unique=True, index=True, nullable=True)

    from_address = Column(String(100), nullable=True)
    to_address = Column(String(100), nullable=True)

    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False)

    block_number = Column(Integer, nullable=True)
    gas_used = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    agent = relationship("Agent")

    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.transaction_type}, amount={self.amount})>"
