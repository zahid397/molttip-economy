import re
from typing import Optional, Tuple, List
from decimal import Decimal, InvalidOperation
from eth_utils import is_address


def validate_wallet_address(address: str) -> Tuple[bool, Optional[str]]:
    """Validate Ethereum wallet address"""
    if not address or not isinstance(address, str):
        return False, "Wallet address is required"

    address = address.strip()

    if not address.startswith("0x"):
        return False, "Wallet address must start with 0x"

    if len(address) != 42:
        return False, "Wallet address must be 42 characters long"

    if not is_address(address):
        return False, "Invalid wallet address format"

    return True, None


def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """Validate username"""
    if not username or not isinstance(username, str):
        return False, "Username is required"

    username = username.strip()

    if len(username) < 3:
        return False, "Username must be at least 3 characters long"

    if len(username) > 50:
        return False, "Username must be less than 50 characters"

    if not re.fullmatch(r"[a-zA-Z0-9_]+", username):
        return False, "Username can only contain letters, numbers, and underscores"

    return True, None


def validate_transaction_hash(tx_hash: str) -> Tuple[bool, Optional[str]]:
    """Validate Ethereum transaction hash"""
    if not tx_hash or not isinstance(tx_hash, str):
        return False, "Transaction hash is required"

    tx_hash = tx_hash.strip()

    if not re.fullmatch(r"0x[a-fA-F0-9]{64}", tx_hash):
        return False, "Invalid transaction hash format"

    return True, None


def validate_amount(amount) -> Tuple[bool, Optional[str]]:
    """Validate tip amount"""
    try:
        amount = Decimal(str(amount))
    except (InvalidOperation, TypeError):
        return False, "Invalid amount format"

    if amount <= 0:
        return False, "Amount must be greater than 0"

    if amount > Decimal("1000000"):
        return False, "Amount is too large"

    return True, None


def validate_content(content: str, content_type: str = "post") -> Tuple[bool, Optional[str]]:
    """Validate post/comment content"""
    if not content or not isinstance(content, str):
        return False, "Content is required"

    content = content.strip()

    if not content:
        return False, "Content cannot be empty"

    max_lengths = {
        "post": 10000,
        "comment": 1000,
        "message": 500,
        "bio": 500
    }

    max_len = max_lengths.get(content_type, 1000)

    if len(content) > max_len:
        return False, f"Content must be less than {max_len} characters"

    return True, None


def validate_tags(tags: Optional[List[str]]) -> Tuple[bool, Optional[str]]:
    """Validate tags list"""
    if not tags:
        return True, None

    if not isinstance(tags, list):
        return False, "Tags must be a list"

    if len(tags) > 10:
        return False, "Maximum 10 tags allowed"

    for tag in tags:
        if not isinstance(tag, str):
            return False, "Invalid tag format"

        tag = tag.strip()

        if not tag:
            return False, "Tag cannot be empty"

        if len(tag) > 50:
            return False, f"Tag '{tag}' is too long (max 50 characters)"

        if not re.fullmatch(r"[a-zA-Z0-9_#]+", tag):
            return False, f"Tag '{tag}' contains invalid characters"

    return True, None
