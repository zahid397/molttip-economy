from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
from eth_utils import is_address
from decimal import Decimal, InvalidOperation
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


def to_checksum_address(address: str) -> Optional[str]:
    """Convert address to checksum format safely"""
    try:
        if not is_address(address):
            return None
        return Web3.to_checksum_address(address)
    except Exception as e:
        logger.error(f"Checksum address conversion error: {e}")
        return None


def from_wei(value: int, unit: str = "ether") -> Decimal:
    """Convert wei to ETH (safe Decimal)"""
    try:
        return Decimal(Web3.from_wei(value, unit))
    except Exception as e:
        logger.error(f"Wei conversion error: {e}")
        return Decimal("0")


def to_wei(value: Decimal, unit: str = "ether") -> int:
    """Convert ETH to wei safely"""
    try:
        return Web3.to_wei(value, unit)
    except Exception as e:
        logger.error(f"Wei conversion error: {e}")
        return 0


def verify_message_signature(message: str, signature: str, expected_address: str) -> bool:
    """Verify signed message ownership"""
    try:
        if not is_address(expected_address):
            return False

        message_encoded = encode_defunct(text=message)
        recovered_address = Account.recover_message(
            message_encoded,
            signature=signature
        )

        return recovered_address.lower() == expected_address.lower()

    except Exception as e:
        logger.error(f"Message signature verification error: {e}")
        return False


def generate_wallet() -> Dict[str, str]:
    """Generate a new Ethereum wallet (DO NOT use in production backend without encryption)"""
    try:
        account = Account.create()

        return {
            "address": account.address,
            "private_key": account.key.hex(),  # ⚠️ Never store plain in DB
            "public_key": account._key_obj.public_key.to_hex()
        }

    except Exception as e:
        logger.error(f"Wallet generation error: {e}")
        return {}


def is_valid_eth_amount(amount: str) -> bool:
    """Validate ETH amount string safely"""
    try:
        value = Decimal(amount)

        if value <= 0:
            return False

        if value > Decimal("1000000"):
            return False

        return True

    except (InvalidOperation, TypeError):
        return False


def format_eth_amount(amount: Decimal, decimals: int = 4) -> str:
    """Format ETH amount safely"""
    try:
        return f"{amount:.{decimals}f}"
    except Exception as e:
        logger.error(f"Amount formatting error: {e}")
        return "0.0000"


def calculate_gas_cost(gas_used: int, gas_price: int) -> Decimal:
    """Calculate gas cost in ETH safely"""
    try:
        gas_cost_wei = gas_used * gas_price
        return from_wei(gas_cost_wei, "ether")
    except Exception as e:
        logger.error(f"Gas cost calculation error: {e}")
        return Decimal("0")
