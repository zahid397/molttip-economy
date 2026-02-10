from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Database
from app.core.logger import setup_logger

from app.middleware.cors import add_cors_middleware
from app.middleware.rate_limit import add_rate_limit_middleware
from app.middleware.logging import LoggingMiddleware

from app.api.routes import (
    auth,
    agent,
    post,
    comment,
    tip,
    leaderboard,
    analytics,
    notifications,
    health
)

# Setup logger
logger = setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting MoltTip Economy Backend...")
    await Database.connect()
    logger.info("✅ Connected to MongoDB")

    yield

    # Shutdown
    logger.info("👋 Shutting down MoltTip Backend...")
    await Database.disconnect()


app = FastAPI(
    title="MoltTip Economy API",
    description="Moltbook-style agent feed + Web3 token tipping economy",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Middleware
add_cors_middleware(app)
add_rate_limit_middleware(app)
app.add_middleware(LoggingMiddleware)

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(agent.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(post.router, prefix="/api/v1/posts", tags=["Posts"])
app.include_router(comment.router, prefix="/api/v1/comments", tags=["Comments"])
app.include_router(tip.router, prefix="/api/v1/tips", tags=["Tips"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard", tags=["Leaderboard"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])


@app.get("/")
async def root():
    return {
        "message": "🚀 Welcome to MoltTip Economy API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else None,
        "status": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
