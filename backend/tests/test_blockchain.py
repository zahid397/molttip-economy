import pytest
from app.services.blockchain_service import BlockchainService
from app.utils.web3_helpers import (
    to_checksum_address,
    from_wei,
    verify_message_signature
)

TEST_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e90F90b1Ba3"


def test_blockchain_service_init():
    """Test blockchain service initialization"""
    service = BlockchainService()
    assert service.web3 is not None
    assert service.erc20_transfer_signature is not None
    assert service.erc20_transfer_signature.startswith("0x")


def test_address_helpers():
    """Test address helper functions"""
    checksum = to_checksum_address(TEST_ADDRESS)

    assert checksum.startswith("0x")
    assert len(checksum) == 42


def test_wei_conversion():
    """Test wei conversion helper"""
    wei_value = 10**18  # 1 ETH
    eth_value = from_wei(wei_value, "ether")

    assert float(eth_value) == 1.0


def test_message_signature_returns_bool():
    """Test verify_message_signature returns bool"""
    message = "Test message"
    fake_signature = "0x" + "1" * 130  # 65 bytes hex signature
    address = TEST_ADDRESS

    result = verify_message_signature(message, fake_signature, address)

    # Always should return bool, not crash
    assert isinstance(result, bool)


def test_is_valid_address():
    """Test BlockchainService address validation"""
    service = BlockchainService()

    assert service.is_valid_address(TEST_ADDRESS) is True
    assert service.is_valid_address("0x123") is False
    assert service.is_valid_address("not_an_address") is False
    assert service.is_valid_address("") is False
