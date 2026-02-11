from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logger import setup_logging
from app.core.database import connect_db, close_db

from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import LoggingMiddleware

from app.api.routes import (
    auth,
    agent,
    post,
    comment,
    tip,
    transaction,
    leaderboard,
    analytics,
    notifications,
    health,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    try:
        await connect_db()
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise e

    yield

    # Shutdown
    await close_db()
    print("🔌 Database connection closed")


app = FastAPI(
    title="Molttip Economy API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Custom Middlewares
# -------------------------
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# -------------------------
# API Routers
# -------------------------
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["auth"])
app.include_router(agent.router, prefix=f"{API_PREFIX}/agents", tags=["agents"])
app.include_router(post.router, prefix=f"{API_PREFIX}/posts", tags=["posts"])
app.include_router(comment.router, prefix=f"{API_PREFIX}/comments", tags=["comments"])
app.include_router(tip.router, prefix=f"{API_PREFIX}/tips", tags=["tips"])
app.include_router(transaction.router, prefix=f"{API_PREFIX}/transactions", tags=["transactions"])
app.include_router(leaderboard.router, prefix=f"{API_PREFIX}/leaderboard", tags=["leaderboard"])
app.include_router(analytics.router, prefix=f"{API_PREFIX}/analytics", tags=["analytics"])
app.include_router(notifications.router, prefix=f"{API_PREFIX}/notifications", tags=["notifications"])
app.include_router(health.router, prefix=f"{API_PREFIX}/health", tags=["health"])


@app.get("/")
async def root():
    return {
        "message": "Molttip Economy API is running 🚀",
        "version": "0.1.0",
    }
