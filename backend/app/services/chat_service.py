import re
from collections import Counter

from sqlalchemy.orm import Session

from app.services.analytics_service import AnalyticsService
from app.services.openai_service import OpenAIService


class ChatService:
    def __init__(self) -> None:
        self.analytics_service = AnalyticsService()
        self.llm_service = OpenAIService()

    def handle_message(self, user_message: str, role: str, db: Session) -> dict:
        if self._is_refresh_candidates_request(user_message):
            days_ahead = self._extract_days_ahead(user_message)
            data = self.analytics_service.get_refresh_candidates(db=db, days_ahead=days_ahead)
            reply = self._build_refresh_reply(data)

            return {
                "reply": reply,
                "model": "local-router",
                "mode": "analytics",
                "task": "refresh_candidates",
                "data": data,
            }

        reply = self.llm_service.generate_reply(user_message=user_message, role=role)
        return {
            "reply": reply,
            "model": self.llm_service.model,
            "mode": "llm",
            "task": None,
            "data": None,
        }

    def _is_refresh_candidates_request(self, user_message: str) -> bool:
        text = user_message.lower()

        laptop_terms = ["laptop", "laptops", "notebook", "notebooks"]
        refresh_terms = [
            "refresh",
            "replace",
            "replacement",
            "due",
            "renew",
            "upgrade",
            "swap",
        ]

        has_laptop_term = any(term in text for term in laptop_terms)
        has_refresh_term = any(term in text for term in refresh_terms)

        return has_laptop_term and has_refresh_term

    def _extract_days_ahead(self, user_message: str) -> int:
        text = user_message.lower()

        day_match = re.search(r"(\d+)\s*day", text)
        if day_match:
            return max(1, min(int(day_match.group(1)), 3650))

        month_match = re.search(r"(\d+)\s*month", text)
        if month_match:
            months = int(month_match.group(1))
            return max(1, min(months * 30, 3650))

        if "soon" in text or "upcoming" in text or "next" in text:
            return 180

        return 180

    def _build_refresh_reply(self, data: dict) -> str:
        total = data["total_candidates"]
        days_ahead = data["days_ahead"]
        results = data["results"]

        if total == 0:
            return (
                f"I checked the database and found no laptops due for refresh "
                f"within the next {days_ahead} days."
            )

        office_counts = Counter(row["office_name"] for row in results)
        office_summary = ", ".join(
            f"{office}: {count}"
            for office, count in sorted(office_counts.items(), key=lambda item: (-item[1], item[0]))
        )

        sample_lines: list[str] = []
        for row in results[:5]:
            days_until = row["days_until_refresh"]

            if days_until is None:
                timing_text = "refresh timing unavailable"
            elif days_until < 0:
                timing_text = f"overdue by {abs(days_until)} days"
            elif days_until == 0:
                timing_text = "due today"
            else:
                timing_text = f"due in {days_until} days"

            sample_lines.append(
                f"- {row['asset_tag']} ({row['manufacturer']} {row['model']}, {row['office_name']}, {timing_text})"
            )

        sample_block = "\n".join(sample_lines)

        return (
            f"I checked the database and found {total} laptop refresh candidates due within the next "
            f"{days_ahead} days.\n\n"
            f"By office: {office_summary}.\n\n"
            f"Top examples:\n"
            f"{sample_block}\n\n"
            f"The full result set is included in the response payload under `data.results`."
        )