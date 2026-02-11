from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from eth_account.messages import encode_defunct
import logging
from typing import Dict, Any, Optional
import asyncio

from app.core.config import settings
from app.core.logger import setup_logger

logger = setup_logger()


class BlockchainService:
    def __init__(self):
        self.web3 = Web3(Web3.HTTPProvider(settings.WEB3_RPC_URL))

        # POA middleware (Base Sepolia / Polygon / BSC)
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)

        # ERC20 Transfer Event Topic
        self.erc20_transfer_signature = Web3.keccak(
            text="Transfer(address,address,uint256)"
        ).hex()

    async def verify_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Verify blockchain transaction (native + ERC20 transfers)"""
        try:
            tx_hash = tx_hash.strip()

            # Web3 is sync, so use thread executor
            tx_receipt = await asyncio.to_thread(
                self.web3.eth.get_transaction_receipt, tx_hash
            )

            if not tx_receipt:
                return {"success": False, "error": "Transaction receipt not found"}

            if tx_receipt.status != 1:
                return {"success": False, "error": "Transaction failed"}

            tx = await asyncio.to_thread(
                self.web3.eth.get_transaction, tx_hash
            )

            # Chain ID validation
            if hasattr(tx, "chainId") and tx.chainId != settings.CHAIN_ID:
                return {"success": False, "error": "Invalid chain ID"}

            transfers = []

            # Parse ERC20 logs
            for log in tx_receipt.logs:
                if len(log.topics) > 0 and log.topics[0].hex() == self.erc20_transfer_signature:
                    try:
                        from_address = Web3.to_checksum_address("0x" + log.topics[1].hex()[-40:])
                        to_address = Web3.to_checksum_address("0x" + log.topics[2].hex()[-40:])

                        # log.data is bytes
                        amount_wei = int.from_bytes(log.data, byteorder="big")

                        transfers.append({
                            "from": from_address,
                            "to": to_address,
                            "amount_wei": str(amount_wei),
                            "token_address": Web3.to_checksum_address(log.address)
                        })

                    except Exception as e:
                        logger.warning(f"Failed to parse ERC20 log: {e}")

            native_value_eth = float(self.web3.from_wei(tx.value, "ether"))

            return {
                "success": True,
                "transaction": {
                    "hash": tx_hash,
                    "from": Web3.to_checksum_address(tx["from"]),
                    "to": Web3.to_checksum_address(tx["to"]) if tx.get("to") else None,
                    "value_eth": native_value_eth,
                    "blockNumber": tx_receipt.blockNumber,
                    "gasUsed": tx_receipt.gasUsed,
                    "transfers": transfers
                }
            }

        except Exception as e:
            logger.error(f"Transaction verification error: {e}")
            return {"success": False, "error": str(e)}

    async def verify_tip_transaction(
        self,
        tx_hash: str,
        expected_from: str,
        expected_to: str,
        expected_amount: float,
        token_address: Optional[str] = None,
        token_decimals: int = 18
    ) -> Dict[str, Any]:
        """
        Verify tip transaction.
        Supports:
        - Native ETH transfer
        - ERC20 transfer (if token_address provided)
        """
        try:
            expected_from = expected_from.lower().strip()
            expected_to = expected_to.lower().strip()

            result = await self.verify_transaction(tx_hash)

            if not result["success"]:
                return result

            transaction = result["transaction"]

            # Validate sender
            if transaction["from"].lower() != expected_from:
                return {
                    "success": False,
                    "verified": False,
                    "error": "Sender wallet mismatch",
                    "expected": expected_from,
                    "found": transaction["from"]
                }

            # Native transfer validation
            if token_address is None:
                if transaction["to"] and transaction["to"].lower() == expected_to:
                    if abs(transaction["value_eth"] - expected_amount) < 0.00001:
                        return {
                            "success": True,
                            "verified": True,
                            "type": "native",
                            "transaction": transaction
                        }

                return {
                    "success": True,
                    "verified": False,
                    "error": "Native transfer mismatch",
                    "transaction": transaction
                }

            # ERC20 transfer validation
            token_address = token_address.lower().strip()

            for transfer in transaction.get("transfers", []):
                if transfer["token_address"].lower() == token_address:
                    if transfer["to"].lower() == expected_to:

                        amount_wei = int(transfer["amount_wei"])
                        amount_token = amount_wei / (10 ** token_decimals)

                        if abs(amount_token - expected_amount) < 0.00001:
                            return {
                                "success": True,
                                "verified": True,
                                "type": "erc20",
                                "transaction": transaction,
                                "transfer": {
                                    **transfer,
                                    "amount": amount_token
                                }
                            }

            return {
                "success": True,
                "verified": False,
                "error": "No matching ERC20 transfer found",
                "transaction": transaction
            }

        except Exception as e:
            logger.error(f"Tip verification error: {e}")
            return {"success": False, "verified": False, "error": str(e)}

    def sign_message(self, private_key: str, message: str) -> str:
        """Sign message using wallet private key"""
        try:
            message_encoded = encode_defunct(text=message)
            signed_message = Account.sign_message(message_encoded, private_key)
            return signed_message.signature.hex()
        except Exception as e:
            logger.error(f"Message signing error: {e}")
            raise

    def recover_address(self, message: str, signature: str) -> str:
        """Recover wallet address from signed message"""
        try:
            message_encoded = encode_defunct(text=message)
            return Account.recover_message(message_encoded, signature=signature)
        except Exception as e:
            logger.error(f"Address recovery error: {e}")
            raise

    async def get_balance(self, address: str) -> Dict[str, Any]:
        """Get native ETH balance"""
        try:
            address = Web3.to_checksum_address(address)

            balance_wei = await asyncio.to_thread(
                self.web3.eth.get_balance, address
            )

            balance_eth = float(self.web3.from_wei(balance_wei, "ether"))

            return {
                "success": True,
                "address": address,
                "native_balance_eth": balance_eth,
                "native_balance_wei": str(balance_wei)
            }

        except Exception as e:
            logger.error(f"Balance check error: {e}")
            return {"success": False, "error": str(e)}

    def is_valid_address(self, address: str) -> bool:
        """Check wallet address format"""
        return Web3.is_address(address)


blockchain_service = BlockchainService()
