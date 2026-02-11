import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from eth_account.messages import encode_defunct
from eth_account import Account

from app.core.config import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT token with expiry.
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode JWT token safely.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def verify_signature(message: str, signature: str, wallet_address: str) -> bool:
    """
    Verify that the signature was signed by the wallet address.
    """
    try:
        encoded_message = encode_defunct(text=message)
        recovered_address = Account.recover_message(encoded_message, signature=signature)
        return recovered_address.lower() == wallet_address.lower()
    except Exception:
        return False
