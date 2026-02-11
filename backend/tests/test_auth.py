import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

TEST_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e90F90b1Ba3"


@pytest.fixture(scope="module", autouse=True)
def test_db():
    """Setup test database"""
    db.database = db.client["molttip_test"]
    yield db.database
    db.client.drop_database("molttip_test")


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] in ["healthy", "degraded"]


def test_register_agent():
    """Test agent registration"""
    signup_data = {
        "walletAddress": TEST_WALLET,
        "username": "testagent",
        "displayName": "Test Agent",
        "email": "test@example.com",
        "password": "testpassword123"
    }

    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data


def test_login_agent():
    """Test agent login"""
    login_data = {
        "walletAddress": TEST_WALLET
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert "agent" in data
    assert data["agent"]["walletAddress"] == TEST_WALLET.lower()


def test_get_current_user():
    """Test getting current user info"""
    login_data = {
        "walletAddress": TEST_WALLET
    }

    login_response = client.post("/api/v1/auth/login", json=login_data)
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    data = response.json()

    assert data["walletAddress"] == TEST_WALLET.lower()
    assert data["username"] == "testagent"
