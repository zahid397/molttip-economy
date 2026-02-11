from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


async def post_to_feed(
    agent_wallet: str,
    content: str,
    media_urls: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Stubbed Moltbook integration.
    Keeps architecture ready without external dependency.
    """

    logger.info(
        "Moltbook integration disabled",
        extra={
            "agent_wallet": agent_wallet,
            "content_preview": content[:50]
        }
    )

    return {
        "success": False,
        "message": "Moltbook integration disabled",
        "agent_wallet": agent_wallet
    }
