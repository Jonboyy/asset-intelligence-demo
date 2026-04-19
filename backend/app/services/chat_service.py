import re
from collections import Counter
from typing import Any

from sqlalchemy.orm import Session

from app.services.analytics_service import AnalyticsService
from app.services.openai_service import OpenAIService


class ChatService:
    def __init__(self) -> None:
        self.analytics_service = AnalyticsService()
        self.llm_service = OpenAIService()

    def handle_message(self, user_message: str, role: str, db: Session) -> dict:
        classification = self._classify_or_fallback(user_message=user_message, role=role)
        intent = classification["intent"]

        if intent == "refresh_candidates":
            days_ahead = self._extract_days_ahead(user_message)
            data = self.analytics_service.get_refresh_candidates(
                db=db,
                days_ahead=days_ahead,
            )
            reply = self._build_refresh_reply(data, classification)

            return {
                "reply": reply,
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "analytics",
                "task": "refresh_candidates",
                "data": data,
                "trace": self._build_trace(
                    classification=classification,
                    mode="analytics",
                    task="refresh_candidates",
                    structured_data_returned=True,
                ),
            }

        if intent == "offboarding_risk":
            data = self.analytics_service.get_offboarding_risk(db=db)
            reply = self._build_offboarding_reply(data, classification)

            return {
                "reply": reply,
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "analytics",
                "task": "offboarding_risk",
                "data": data,
                "trace": self._build_trace(classification, "analytics", "offboarding_risk", True)
            }

        if intent == "data_quality_audit":
            data = self.analytics_service.get_data_quality_audit(db=db)
            reply = self._build_data_quality_reply(data, classification)

            return {
                "reply": reply,
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "analytics",
                "task": "data_quality_audit",
                "data": data,
                "trace": self._build_trace(classification, "analytics", "data_quality_audit", True)
            }

        if intent == "license_utilization":
            data = self.analytics_service.get_license_utilization(db=db)
            reply = self._build_license_utilization_reply(data, classification)

            return {
                "reply": reply,
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "analytics",
                "task": "license_utilization",
                "data": data,
                "trace": self._build_trace(classification, "analytics", "license_utilization", True)
            }

        if intent == "clarification_needed":
            question = classification.get("clarifying_question") or (
                "Could you clarify which asset intelligence area you want to analyze?"
            )

            return {
                "reply": (
                    "I need one clarification before running an analysis.\n\n"
                    f"{question}\n\n"
                    "Supported areas include refresh candidates, offboarding risk, data quality audit, "
                    "and software license utilization."
                ),
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "clarification",
                "task": "clarification_needed",
                "data": None,
                "trace": self._build_trace(classification, "clarification", "clarification_needed", False)
            }

        if intent == "unsupported":
            return {
                "reply": (
                    "I understand the request is related to asset intelligence, but this specific analysis "
                    "is not supported in the demo yet.\n\n"
                    "Supported tasks are refresh candidates, offboarding risk, data quality audit, "
                    "and software license utilization."
                ),
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "unsupported",
                "task": "unsupported",
                "data": None,
                "trace": self._build_trace(classification, "unsupported", "unsupported", False)
            }

        if intent == "out_of_scope":
            return {
                "reply": (
                    "I can’t help with that request because this assistant is limited to company asset, "
                    "inventory, warranty, maintenance, offboarding, and software license analytics."
                ),
                "model": f"intent-classifier:{self.llm_service.model}",
                "mode": "out_of_scope",
                "task": "out_of_scope",
                "data": None,
                "trace": self._build_trace(classification, "out_of_scope", "out_of_scope", False)
            }

        reply = self.llm_service.generate_reply(user_message=user_message, role=role)

        return {
            "reply": reply,
            "model": self.llm_service.model,
            "mode": "llm",
            "task": None,
            "data": None,
            "trace": {
                "intent": None,
                "confidence": None,
                "reason": "Fallback LLM response without structured analytics routing.",
                "selected_task": None,
                "mode": "llm",
                "model": self.llm_service.model,
                "structured_data_returned": False,
            },
        }

    def _classify_or_fallback(self, user_message: str, role: str) -> dict[str, Any]:
        try:
            classification = self.llm_service.classify_intent(
                user_message=user_message,
                role=role,
            )

            if classification["confidence"] >= 0.55:
                return classification

            print(
                f"Intent classifier confidence too low: {classification}",
                flush=True,
            )
        except Exception as exc:
            print(
                f"Intent classifier failed: {exc}",
                flush=True,
            )

        return self._heuristic_classification(user_message)

    def _heuristic_classification(self, user_message: str) -> dict[str, Any]:
        fallback_reason = (
            "AI classifier was unavailable or returned invalid JSON. "
            "Used deterministic fallback routing."
        )

        if self._is_refresh_candidates_request(user_message):
            return {
                "intent": "refresh_candidates",
                "confidence": None,
                "reason": fallback_reason,
                "clarifying_question": None,
            }

        if self._is_offboarding_risk_request(user_message):
            return {
                "intent": "offboarding_risk",
                "confidence": None,
                "reason": fallback_reason,
                "clarifying_question": None,
            }

        if self._is_data_quality_request(user_message):
            return {
                "intent": "data_quality_audit",
                "confidence": None,
                "reason": fallback_reason,
                "clarifying_question": None,
            }

        if self._is_license_utilization_request(user_message):
            return {
                "intent": "license_utilization",
                "confidence": None,
                "reason": fallback_reason,
                "clarifying_question": None,
            }

        return {
            "intent": "clarification_needed",
            "confidence": None,
            "reason": fallback_reason,
            "clarifying_question": (
                "Do you want to analyze refresh candidates, offboarding risk, data quality, "
                "or software license utilization?"
            ),
        }

    def _is_refresh_candidates_request(self, user_message: str) -> bool:
        text = user_message.lower()

        laptop_terms = ["laptop", "laptops", "notebook", "notebooks", "device", "devices"]
        refresh_terms = [
            "refresh",
            "replace",
            "replacement",
            "due",
            "renew",
            "upgrade",
            "swap",
            "lifecycle",
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

    def _is_license_utilization_request(self, user_message: str) -> bool:
        text = user_message.lower()

        license_terms = [
            "license",
            "licenses",
            "software license",
            "software licenses",
            "seats",
            "subscriptions",
            "subscription",
        ]

        utilization_terms = [
            "underutilized",
            "underused",
            "unused",
            "low utilization",
            "utilization",
            "waste",
            "cost",
            "saving",
            "savings",
            "overspend",
        ]

        has_license_term = any(term in text for term in license_terms)
        has_utilization_term = any(term in text for term in utilization_terms)

        return has_license_term and has_utilization_term

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

    def _classification_note(self, classification: dict[str, Any]) -> str:
        return ""
    
    def _build_trace(
        self,
        classification: dict[str, Any],
        mode: str,
        task: str | None,
        structured_data_returned: bool,
    ) -> dict[str, Any]:
        return {
            "intent": classification.get("intent"),
            "confidence": classification.get("confidence"),
            "reason": classification.get("reason"),
            "selected_task": task,
            "mode": mode,
            "model": self.llm_service.model,
            "structured_data_returned": structured_data_returned,
        }

    def _build_refresh_reply(self, data: dict, classification: dict[str, Any]) -> str:
        total = data["total_candidates"]
        days_ahead = data["days_ahead"]
        results = data["results"]

        if total == 0:
            return (
                "Database check complete.\n\n"
                f"No laptop refresh candidates were found within the next {days_ahead} days."
                + self._classification_note(classification)
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
            "The full list is shown in the Results panel."
            + self._classification_note(classification)
        )

    def _build_offboarding_reply(self, data: dict, classification: dict[str, Any]) -> str:
        total_risks = data["total_risks"]
        total_active_assets = data["total_active_assets"]
        total_active_licenses = data["total_active_licenses"]
        high_risk_count = data["high_risk_count"]

        if total_risks == 0:
            return (
                "Database check complete.\n\n"
                "No offboarding risks were found. Terminated employees do not appear to have active "
                "asset or software license assignments."
                + self._classification_note(classification)
            )

        return (
            "Database check complete.\n\n"
            f"I found {total_risks} terminated employee{'s' if total_risks != 1 else ''} with active "
            "asset or software license assignments.\n\n"
            f"Exposure: {total_active_assets} active asset assignment{'s' if total_active_assets != 1 else ''} "
            f"and {total_active_licenses} active software license assignment{'s' if total_active_licenses != 1 else ''}.\n\n"
            f"Risk level: {high_risk_count} high-risk case{'s' if high_risk_count != 1 else ''} detected.\n\n"
            "The full offboarding risk table is shown in the Results panel."
            + self._classification_note(classification)
        )

    def _build_data_quality_reply(self, data: dict, classification: dict[str, Any]) -> str:
        total_assets = data["total_assets_with_issues"]
        total_missing_fields = data["total_missing_fields"]
        missing_serial = data["missing_serial_count"]
        missing_purchase = data["missing_purchase_date_count"]
        missing_warranty = data["missing_warranty_count"]
        missing_vendor = data["missing_vendor_count"]

        if total_assets == 0:
            return (
                "Database check complete.\n\n"
                "No asset data quality issues were found for the audited fields."
                + self._classification_note(classification)
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
            + self._classification_note(classification)
        )

    def _build_license_utilization_reply(self, data: dict, classification: dict[str, Any]) -> str:
        total_products = data["total_products_flagged"]
        total_unused_seats = data["total_unused_seats"]
        estimated_unused_cost = data["estimated_total_unused_cost"]
        threshold = data["threshold_percent"]
        lowest_utilization = data["lowest_utilization_percent"]

        if total_products == 0:
            return (
                "Database check complete.\n\n"
                f"No software products were found below the {threshold}% utilization threshold."
                + self._classification_note(classification)
            )

        return (
            "Database check complete.\n\n"
            f"I found {total_products} software product{'s' if total_products != 1 else ''} below "
            f"the {threshold}% utilization threshold.\n\n"
            f"Potential waste: {total_unused_seats} unused seat{'s' if total_unused_seats != 1 else ''} "
            f"with an estimated annual unused cost of €{estimated_unused_cost:,.2f}.\n\n"
            f"Lowest utilization detected: {lowest_utilization}%.\n\n"
            "The full license utilization table is shown in the Results panel."
            + self._classification_note(classification)
        )