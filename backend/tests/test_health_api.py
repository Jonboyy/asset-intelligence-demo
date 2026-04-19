from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint_returns_running_message():
    response = client.get("/")

    assert response.status_code == 200

    body = response.json()
    assert body["message"] == "Asset Intelligence Assistant API is running."
    assert body["docs_url"] == "/docs"


def test_health_endpoint_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "ok"
    assert body["environment"] == "test"