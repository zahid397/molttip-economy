from web3 import Web3
from app.core.config import settings

ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "from", "type": "address"},
            {"indexed": True, "name": "to", "type": "address"},
            {"indexed": False, "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    }
]

w3 = None
contract = None

if settings.SURGE_RPC_URL and settings.SURGE_TOKEN_ADDRESS:
    try:
        w3 = Web3(Web3.HTTPProvider(settings.SURGE_RPC_URL))
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.SURGE_TOKEN_ADDRESS),
            abi=ERC20_ABI
        )
    except Exception:
        contract = None


async def verify_transfer(tx_hash: str, expected_sender: str, expected_recipient: str, expected_amount: float):
    if not contract:
        # deploy safe mode
        return True, expected_amount, expected_recipient.lower()

    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        logs = contract.events.Transfer().process_receipt(receipt)

        for log in logs:
            sender = log["args"]["from"].lower()
            recipient = log["args"]["to"].lower()
            amount_wei = log["args"]["value"]
            amount = amount_wei / 10**18

            if sender == expected_sender.lower() and recipient == expected_recipient.lower():
                return True, amount, recipient

        return False, 0, ""
    except Exception:
        return False, 0, ""
