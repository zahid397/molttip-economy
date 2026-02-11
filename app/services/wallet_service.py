from web3 import Web3
from typing import Optional
from app.core.config import settings


class WalletService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))

    def is_connected(self) -> bool:
        try:
            return self.w3.is_connected()
        except Exception:
            return False

    def validate_address(self, address: str) -> bool:
        try:
            return self.w3.is_address(address)
        except Exception:
            return False

    def get_balance(self, address: str) -> Optional[float]:
        if not self.validate_address(address):
            return None

        try:
            balance_wei = self.w3.eth.get_balance(address)
            return float(self.w3.from_wei(balance_wei, "ether"))
        except Exception:
            return None


wallet_service = WalletService()
