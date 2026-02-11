from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from datetime import datetime
from app.core.config import settings
from app.api.routes import auth, posts, comments, tips, users, notifications, analytics, health

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Molttip Economy Backend",
    description="Social tipping platform with blockchain integration",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(posts.router, prefix=settings.API_V1_PREFIX)
app.include_router(comments.router, prefix=settings.API_V1_PREFIX)
app.include_router(tips.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(health.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Molttip Economy Backend 🚀",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs" if settings.DEBUG else None
    }

@app.get("/api/v1")
async def api_root():
    """API root endpoint"""
    return {
        "name": "Molttip API v1",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": [
            "/auth",
            "/posts",
            "/comments",
            "/tips",
            "/users",
            "/notifications",
            "/analytics",
            "/health"
        ]
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        error_dict = {
            "field": ".".join(map(str, error["loc"])),
            "message": error["msg"],
            "type": error["type"]
        }
        errors.append(error_dict)
    
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Validation error",
            "code": "VALIDATION_ERROR",
            "details": {"errors": errors}
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handle generic exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "code": "INTERNAL_ERROR",
            "details": {"message": str(exc)} if settings.DEBUG else None
        }
    )

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("Starting Molttip Economy Backend...")
    
    # Initialize database connections
    from app.core.database import async_client
    await async_client.admin.command("ping")
    logger.info("Database connected successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Shutting down Molttip Economy Backend...")
    
    # Close database connections
    from app.core.database import async_client
    if async_client:
        async_client.close()
        logger.info("Database connections closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=10000,
        reload=settings.DEBUG
    )
