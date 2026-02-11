import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logger import setup_logger

logger = setup_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log incoming request
        logger.info(f"➡️ {request.method} {request.url.path}")

        try:
            response = await call_next(request)

            process_time = time.time() - start_time

            logger.info(
                f"✅ {request.method} {request.url.path} "
                f"Status={response.status_code} Time={process_time:.3f}s"
            )

            response.headers["X-Process-Time"] = str(process_time)

            return response

        except Exception as e:
            process_time = time.time() - start_time

            logger.error(
                f"❌ {request.method} {request.url.path} "
                f"Error={str(e)} Time={process_time:.3f}s"
            )
            raise
