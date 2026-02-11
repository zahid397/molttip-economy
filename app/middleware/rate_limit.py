from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque
import time
from typing import Dict


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls_per_minute: int = 60):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.requests: Dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/health"):
            return await call_next(request)

        client_ip = request.client.host
        now = time.time()
        window_start = now - 60

        # Remove old timestamps
        while self.requests[client_ip] and self.requests[client_ip][0] < window_start:
            self.requests[client_ip].popleft()

        # Check limit
        if len(self.requests[client_ip]) >= self.calls_per_minute:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")

        self.requests[client_ip].append(now)

        response = await call_next(request)
        return response
