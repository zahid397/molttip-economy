from web3 import Web3
from typing import List, Dict, Any
from app.core.config import settings


def load_contract_abi() -> List[Dict[str, Any]]:
    """
    Load minimal ERC20 ABI.
    In production this should come from a JSON file or Etherscan.
    """
    return [
        {
            "constant": False,
            "inputs": [
                {"name": "_to", "type": "address"},
                {"name": "_value", "type": "uint256"},
            ],
            "name": "transfer",
            "outputs": [{"name": "", "type": "bool"}],
            "type": "function",
        }
    ]


def build_transfer_tx(
    w3: Web3,
    from_address: str,
    to_address: str,
    amount_wei: int,
):
    """
    Build unsigned ERC20 transfer transaction.
    NOTE: Client signs transaction (MetaMask).
    """

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(settings.SURGE_TOKEN_ADDRESS),
        abi=load_contract_abi(),
    )

    return contract.functions.transfer(
        Web3.to_checksum_address(to_address),
        amount_wei,
    ).build_transaction(
        {
            "from": Web3.to_checksum_address(from_address),
            "nonce": w3.eth.get_transaction_count(from_address),
            "gas": 100000,
            "gasPrice": w3.eth.gas_price,
        }
    )
