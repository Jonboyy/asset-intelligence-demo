from app.services.chat_service import ChatService


def test_extract_days_ahead_from_months():
    service = ChatService()

    result = service._extract_days_ahead(
        "Which laptops need replacement in the next 6 months?"
    )

    assert result == 180


def test_extract_days_ahead_from_days():
    service = ChatService()

    result = service._extract_days_ahead(
        "Show refresh candidates due within the next 90 days."
    )

    assert result == 90


def test_heuristic_routing_detects_refresh_candidates():
    service = ChatService()

    result = service._heuristic_classification(
        "Which laptops need replacement in the next 6 months?"
    )

    assert result["intent"] == "refresh_candidates"


def test_heuristic_routing_detects_offboarding_risk():
    service = ChatService()

    result = service._heuristic_classification(
        "Which terminated employees still have assigned devices or active software licenses?"
    )

    assert result["intent"] == "offboarding_risk"


def test_heuristic_routing_detects_data_quality_audit():
    service = ChatService()

    result = service._heuristic_classification(
        "Show assets with missing critical data."
    )

    assert result["intent"] == "data_quality_audit"


def test_heuristic_routing_detects_license_utilization():
    service = ChatService()

    result = service._heuristic_classification(
        "Which software licenses are underutilized?"
    )

    assert result["intent"] == "license_utilization"


def test_heuristic_routing_asks_for_clarification_when_unclear():
    service = ChatService()

    result = service._heuristic_classification(
        "Show me risky stuff."
    )

    assert result["intent"] == "clarification_needed"
    assert result["clarifying_question"] is not None