import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

TEST_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e90F90b1Ba3"


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """Setup test database"""
    db.database = db.client["molttip_test"]
    yield db.database
    db.client.drop_database("molttip_test")


@pytest.fixture(scope="module")
def auth_token():
    """Signup + Login and return token"""
    signup_data = {
        "walletAddress": TEST_WALLET,
        "username": "testagent",
        "email": "test@example.com",
        "password": "testpassword123"
    }

    client.post("/api/v1/auth/signup", json=signup_data)

    login_data = {"walletAddress": TEST_WALLET}
    login_response = client.post("/api/v1/auth/login", json=login_data)

    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture(scope="module")
def created_post_id(auth_token):
    """Create post and return post ID"""
    post_data = {
        "content": "Test post content",
        "tags": ["test", "blockchain"],
        "isAiGenerated": False
    }

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/v1/posts/", json=post_data, headers=headers)

    assert response.status_code == 200
    data = response.json()

    assert data["content"] == "Test post content"
    assert data["agentUsername"] == "testagent"

    return data["id"]


def test_create_post(created_post_id):
    """Just confirm post was created"""
    assert created_post_id is not None


def test_create_tip(auth_token, created_post_id):
    """Test creating a tip (pending verification)"""

    tip_data = {
        "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "fromAddress": TEST_WALLET,
        "toAddress": TEST_WALLET,
        "postId": created_post_id,
        "amount": 0.1,
        "tokenSymbol": "ETH",
        "message": "Test tip"
    }

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/v1/tips/", json=tip_data, headers=headers)

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "pending"
    assert data["amount"] == 0.1
    assert data["postId"] == created_post_id


def test_get_tips():
    """Test getting tips list"""
    response = client.get(f"/api/v1/tips/?wallet_address={TEST_WALLET}")

    assert response.status_code == 200
    data = response.json()

    assert "tips" in data
    assert "total" in data
    assert isinstance(data["tips"], list)
