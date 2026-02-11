from web3 import Web3
from web3.exceptions import BadFunctionCallOutput
from typing import List, Dict, Any
from app.core.config import settings
from app.core.database import get_db


# Initialize Web3 safely
w3 = Web3(Web3.HTTPProvider(settings.SURGE_RPC_URL)) if settings.SURGE_RPC_URL else None


ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    }
]


contract = None
if w3 and settings.SURGE_TOKEN_ADDRESS:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(settings.SURGE_TOKEN_ADDRESS),
        abi=ERC20_ABI,
    )


# ---------------------------------------
# Get On-chain Balance
# ---------------------------------------

async def get_balance(wallet_address: str) -> float:
    """
    Returns SURGE balance as float.
    Safe fallback if RPC not configured.
    """
    if not contract:
        return 0.0

    try:
        address = Web3.to_checksum_address(wallet_address)
        balance_wei = contract.functions.balanceOf(address).call()
        return balance_wei / (10 ** settings.SURGE_DECIMALS)
    except (BadFunctionCallOutput, ValueError):
        return 0.0


# ---------------------------------------
# Transaction History (From DB)
# ---------------------------------------

async def get_transaction_history(wallet_address: str, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Returns last N transactions stored in our DB.
    """
    db = get_db()
    cursor = (
        db.transactions
        .find({"wallet_address": wallet_address.lower()})
        .sort("timestamp", -1)
        .limit(limit)
    )

    return await cursor.to_list(length=limit)
