from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def add_cors_middleware(app):
    """Add CORS middleware to FastAPI app"""

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,  # e.g. ["http://localhost:3000", "https://moltbook.app"]
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With"
        ],
        expose_headers=[
            "Authorization",
            "X-Process-Time"
        ],
    )
