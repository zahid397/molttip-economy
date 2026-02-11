from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import client, db
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.api.routes import (
    auth, agent, post, comment, tip,
    leaderboard, notifications, ai, health
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    yield
    # Shutdown
    client.close()


app = FastAPI(
    title="MoltTip Economy API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

api_prefix = "/api/v1"

app.include_router(auth.router, prefix=f"{api_prefix}/auth")
app.include_router(agent.router, prefix=f"{api_prefix}/agents")
app.include_router(post.router, prefix=f"{api_prefix}/posts")
app.include_router(comment.router, prefix=f"{api_prefix}/comments")
app.include_router(tip.router, prefix=f"{api_prefix}/tips")
app.include_router(leaderboard.router, prefix=f"{api_prefix}/leaderboard")
app.include_router(notifications.router, prefix=f"{api_prefix}/notifications")
app.include_router(ai.router, prefix=f"{api_prefix}/ai")
app.include_router(health.router, prefix=f"{api_prefix}/health")

@app.get("/")
async def root():
    return {"message": "MoltTip Economy API is running 🚀"}
