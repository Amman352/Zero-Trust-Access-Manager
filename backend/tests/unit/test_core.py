import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Zero Trust Access Manager API"


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_docs_available():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/docs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_register_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/auth/register", json={
            "email": "notanemail",
            "username": "a",
            "password": "weak"
        })
    assert response.status_code == 422


def test_risk_scorer():
    from app.ml.risk_scorer import risk_scorer
    result = risk_scorer.score(
        failed_attempts=0,
        mfa_enabled=True,
        user_agent="Mozilla/5.0",
        is_new_device=False,
    )
    assert "risk_score" in result
    assert "risk_level" in result
    assert result["risk_score"] >= 0
    assert result["risk_score"] <= 100
    assert result["risk_level"] in ["low", "medium", "high", "critical"]


def test_risk_scorer_high_risk():
    from app.ml.risk_scorer import risk_scorer
    result = risk_scorer.score(
        failed_attempts=5,
        mfa_enabled=False,
        user_agent="python-requests/2.28",
        is_new_device=True,
    )
    assert result["risk_score"] > 50
    assert result["risk_level"] in ["high", "critical"]


def test_security_password_hashing():
    from app.core.security import hash_password, verify_password
    hashed = hash_password("TestPass123")
    assert hashed != "TestPass123"
    assert verify_password("TestPass123", hashed)
    assert not verify_password("WrongPass", hashed)


def test_security_jwt_tokens():
    from app.core.security import create_access_token, decode_token
    token = create_access_token(user_id="test-id", role="user")
    payload = decode_token(token)
    assert payload["sub"] == "test-id"
    assert payload["role"] == "user"
    assert payload["type"] == "access"
