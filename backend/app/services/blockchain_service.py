from typing import Tuple
from web3 import Web3
from web3.exceptions import TransactionNotFound, BadFunctionCallOutput
from app.core.config import settings


# Initialize Web3 safely
w3 = Web3(Web3.HTTPProvider(settings.SURGE_RPC_URL)) if settings.SURGE_RPC_URL else None


ERC20_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "from", "type": "address"},
            {"indexed": True, "name": "to", "type": "address"},
            {"indexed": False, "name": "value", "type": "uint256"},
        ],
        "name": "Transfer",
        "type": "event",
    }
]


contract = None
if w3 and settings.SURGE_TOKEN_ADDRESS:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(settings.SURGE_TOKEN_ADDRESS),
        abi=ERC20_ABI,
    )


# ---------------------------------------------------
# Verify ERC20 Transfer
# ---------------------------------------------------

async def verify_transfer(
    tx_hash: str,
    expected_sender: str,
    expected_recipient: str,
    expected_amount: float,
) -> Tuple[bool, float, str]:
    """
    Verify SURGE token transfer using ERC20 Transfer event.
    Returns:
        (verified, actual_amount, actual_recipient)
    """

    if not w3 or not contract:
        return False, 0.0, ""

    try:
        tx_receipt = w3.eth.get_transaction_receipt(tx_hash)
    except TransactionNotFound:
        return False, 0.0, ""
    except Exception:
        return False, 0.0, ""

    if not tx_receipt or tx_receipt.get("status") != 1:
        return False, 0.0, ""

    try:
        logs = contract.events.Transfer().process_receipt(tx_receipt)
    except (BadFunctionCallOutput, Exception):
        return False, 0.0, ""

    expected_sender = expected_sender.lower()
    expected_recipient = expected_recipient.lower()

    for log in logs:
        sender = log["args"]["from"].lower()
        recipient = log["args"]["to"].lower()
        amount_wei = log["args"]["value"]

        amount = amount_wei / (10 ** settings.SURGE_DECIMALS)

        # small tolerance for float comparison
        if (
            sender == expected_sender
            and recipient == expected_recipient
            and abs(amount - expected_amount) < 1e-9
        ):
            return True, amount, recipient

    return False, 0.0, ""
