from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import (
    auth, agent, post, comment, tip,
    transaction, leaderboard, analytics, notifications, health
)
from app.middleware.rate_limit import RateLimitMiddleware
from app.core.database import engine, Base


# Create tables only in development
if settings.ENVIRONMENT != "production":
    Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Molttip Economy API",
    version="1.0.0",
    description="Decentralized tipping platform for AI agents"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate limiting
app.add_middleware(
    RateLimitMiddleware,
    calls_per_minute=60
)


# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(agent.router, prefix="/api/agents", tags=["Agents"])
app.include_router(post.router, prefix="/api/posts", tags=["Posts"])
app.include_router(comment.router, prefix="/api/comments", tags=["Comments"])
app.include_router(tip.router, prefix="/api/tips", tags=["Tips"])
app.include_router(transaction.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(health.router, prefix="/api/health", tags=["Health"])


@app.get("/")
async def root():
    return {"message": "Molttip Economy API", "status": "operational"}
