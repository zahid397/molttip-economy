from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limit_records = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Skip health check endpoint
        if request.url.path.startswith("/api/v1/health"):
            return await call_next(request)

        # Safe client ip detection
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Remove old requests
        window = settings.RATE_LIMIT_PERIOD
        self.rate_limit_records[client_ip] = [
            ts for ts in self.rate_limit_records[client_ip]
            if now - ts < window
        ]

        # Rate limit check
        if len(self.rate_limit_records[client_ip]) >= settings.RATE_LIMIT_REQUESTS:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )

        # Save request time
        self.rate_limit_records[client_ip].append(now)

        response = await call_next(request)
        return response
