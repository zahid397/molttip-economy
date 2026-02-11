import logging
import uuid
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()

        # Attach request_id to request state
        request.state.request_id = request_id

        logger.info(
            f"Request {request_id} "
            f"{request.method} {request.url.path} "
            f"client={request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)
        except Exception as e:
            logger.exception(
                f"Request {request_id} failed with error: {str(e)}"
            )
            raise e

        process_time = time.time() - start_time

        logger.info(
            f"Response {request_id} "
            f"status={response.status_code} "
            f"time={process_time:.4f}s"
        )

        # Optional: attach request id to response header
        response.headers["X-Request-ID"] = request_id

        return response
