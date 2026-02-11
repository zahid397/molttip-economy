import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Optional request_id support
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id

        # Include exception traceback if exists
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_record)


def setup_logging():
    """
    Setup JSON structured logging for production (Render-friendly).
    Prevents duplicate handlers.
    """
    root_logger = logging.getLogger()

    # Prevent duplicate handlers in reload / multiple imports
    if root_logger.handlers:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)
