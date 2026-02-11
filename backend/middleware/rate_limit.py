from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings

# Initialize limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"]
)

def add_rate_limit_middleware(app):
    """Add rate limiting middleware to FastAPI app"""

    # Attach limiter to app state
    app.state.limiter = limiter

    # Add SlowAPI middleware
    app.add_middleware(SlowAPIMiddleware)

    # Add exception handler
    app.add_exception_handler(
        RateLimitExceeded,
        _rate_limit_exceeded_handler
    )
