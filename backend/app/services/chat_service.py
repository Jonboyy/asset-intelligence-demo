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
            data = self.analytics_service.get_refresh_candidates(
                db=db,
                days_ahead=days_ahead,
            )
            reply = self._build_refresh_reply(data)

            return {
                "reply": reply,
                "model": "local-router",
                "mode": "analytics",
                "task": "refresh_candidates",
                "data": data,
            }

        if self._is_offboarding_risk_request(user_message):
            data = self.analytics_service.get_offboarding_risk(db=db)
            reply = self._build_offboarding_reply(data)

            return {
                "reply": reply,
                "model": "local-router",
                "mode": "analytics",
                "task": "offboarding_risk",
                "data": data,
            }

        if self._is_data_quality_request(user_message):
            data = self.analytics_service.get_data_quality_audit(db=db)
            reply = self._build_data_quality_reply(data)

            return {
                "reply": reply,
                "model": "local-router",
                "mode": "analytics",
                "task": "data_quality_audit",
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

    def _is_offboarding_risk_request(self, user_message: str) -> bool:
        text = user_message.lower()

        offboarding_terms = [
            "offboarding",
            "terminated",
            "former employee",
            "former employees",
            "left the company",
            "ex employee",
            "ex-employee",
        ]

        risk_terms = [
            "risk",
            "assigned",
            "assignment",
            "device",
            "devices",
            "asset",
            "assets",
            "license",
            "licenses",
            "software",
            "still have",
            "active",
        ]

        has_offboarding_term = any(term in text for term in offboarding_terms)
        has_risk_term = any(term in text for term in risk_terms)

        return has_offboarding_term and has_risk_term

    def _is_data_quality_request(self, user_message: str) -> bool:
        text = user_message.lower()

        data_quality_terms = [
            "data quality",
            "missing data",
            "incomplete data",
            "missing fields",
            "missing critical data",
            "audit",
            "inventory quality",
            "missing serial",
            "missing purchase",
            "missing warranty",
            "missing vendor",
        ]

        asset_terms = [
            "asset",
            "assets",
            "inventory",
            "records",
            "data",
        ]

        has_data_quality_term = any(term in text for term in data_quality_terms)
        has_asset_context = any(term in text for term in asset_terms)

        return has_data_quality_term and has_asset_context

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
                "Database check complete.\n\n"
                f"No laptop refresh candidates were found within the next {days_ahead} days.\n\n"
                "The Results panel has been updated with the structured response."
            )

        office_counts = Counter(row["office_name"] for row in results)
        office_summary = ", ".join(
            f"{office}: {count}"
            for office, count in sorted(
                office_counts.items(),
                key=lambda item: (-item[1], item[0]),
            )
        )

        overdue_count = sum(
            1
            for row in results
            if row["days_until_refresh"] is not None and row["days_until_refresh"] < 0
        )

        most_urgent_values = [
            row["days_until_refresh"]
            for row in results
            if row["days_until_refresh"] is not None
        ]

        if most_urgent_values:
            most_urgent = min(most_urgent_values)
            if most_urgent < 0:
                urgency_text = f"The most urgent device is overdue by {abs(most_urgent)} days."
            elif most_urgent == 0:
                urgency_text = "The most urgent device is due today."
            else:
                urgency_text = f"The most urgent device is due in {most_urgent} days."
        else:
            urgency_text = "Urgency timing is unavailable for these results."

        return (
            "Database check complete.\n\n"
            f"I found {total} laptop refresh candidates within the next {days_ahead} days.\n\n"
            f"Office impact: {office_summary}.\n\n"
            f"Urgency: {overdue_count} candidate{'s' if overdue_count != 1 else ''} already overdue. "
            f"{urgency_text}\n\n"
            "The full list is shown in the Results panel, including summary cards, charts, and the detailed table."
        )

    def _build_offboarding_reply(self, data: dict) -> str:
        total_risks = data["total_risks"]
        total_active_assets = data["total_active_assets"]
        total_active_licenses = data["total_active_licenses"]
        high_risk_count = data["high_risk_count"]

        if total_risks == 0:
            return (
                "Database check complete.\n\n"
                "No offboarding risks were found. Terminated employees do not appear to have active "
                "asset or software license assignments.\n\n"
                "The Results panel has been updated with the structured response."
            )

        return (
            "Database check complete.\n\n"
            f"I found {total_risks} terminated employee{'s' if total_risks != 1 else ''} with active "
            "asset or software license assignments.\n\n"
            f"Exposure: {total_active_assets} active asset assignment{'s' if total_active_assets != 1 else ''} "
            f"and {total_active_licenses} active software license assignment{'s' if total_active_licenses != 1 else ''}.\n\n"
            f"Risk level: {high_risk_count} high-risk case{'s' if high_risk_count != 1 else ''} detected.\n\n"
            "The full offboarding risk table is shown in the Results panel."
        )

    def _build_data_quality_reply(self, data: dict) -> str:
        total_assets = data["total_assets_with_issues"]
        total_missing_fields = data["total_missing_fields"]
        missing_serial = data["missing_serial_count"]
        missing_purchase = data["missing_purchase_date_count"]
        missing_warranty = data["missing_warranty_count"]
        missing_vendor = data["missing_vendor_count"]

        if total_assets == 0:
            return (
                "Database check complete.\n\n"
                "No asset data quality issues were found for the audited fields.\n\n"
                "The Results panel has been updated with the structured response."
            )

        return (
            "Database check complete.\n\n"
            f"I found {total_assets} asset record{'s' if total_assets != 1 else ''} with missing critical data.\n\n"
            f"Total missing fields detected: {total_missing_fields}.\n\n"
            "Issue breakdown: "
            f"{missing_serial} missing serial number, "
            f"{missing_purchase} missing purchase date, "
            f"{missing_warranty} missing warranty end date, "
            f"and {missing_vendor} missing vendor.\n\n"
            "The full data quality audit table is shown in the Results panel."
        )