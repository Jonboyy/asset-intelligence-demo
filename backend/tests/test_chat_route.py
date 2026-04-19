from fastapi.testclient import TestClient

from app.api.routes import chat as chat_route
from app.main import app


client = TestClient(app)


def test_chat_endpoint_returns_expected_response_shape(monkeypatch):
    class FakeChatService:
        def handle_message(self, user_message: str, role: str, db):
            return {
                "reply": f"Received: {user_message}",
                "model": "test-model",
                "mode": "analytics",
                "task": "refresh_candidates",
                "data": None,
                "trace": {
                    "intent": "refresh_candidates",
                    "confidence": 0.95,
                    "reason": "Test classifier selected refresh candidates.",
                    "selected_task": "refresh_candidates",
                    "mode": "analytics",
                    "model": "test-model",
                    "structured_data_returned": False,
                },
            }

    monkeypatch.setattr(chat_route, "ChatService", FakeChatService)

    response = client.post(
        "/chat",
        json={
            "message": "Which laptops are due for refresh soon?",
            "role": "asset_manager",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert body["reply"] == "Received: Which laptops are due for refresh soon?"
    assert body["model"] == "test-model"
    assert body["mode"] == "analytics"
    assert body["task"] == "refresh_candidates"
    assert body["trace"]["intent"] == "refresh_candidates"