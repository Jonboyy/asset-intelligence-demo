import json
import re
from typing import Any

from openai import OpenAI

from app.config import get_settings


class OpenAIService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.llm_model
        self.client = OpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
        )

    def generate_reply(self, user_message: str, role: str) -> str:
        system_prompt = f"""
You are an enterprise asset intelligence assistant.

Your domain is limited to:
- company assets
- asset assignments
- maintenance history
- warranties
- software licenses
- inventory and lifecycle analysis

The current user role is: {role}

Rules:
- Be concise and helpful.
- Do not claim to query live database data unless the backend has returned structured data.
- Stay within the asset intelligence domain.
- If the user asks for something outside the domain, politely explain the assistant's scope.
"""

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
        )

        content = completion.choices[0].message.content
        return content.strip() if content else "No response returned by the model."

    def classify_intent(self, user_message: str, role: str) -> dict[str, Any]:
        system_prompt = f"""
You are an intent classifier for an enterprise asset intelligence assistant.

The current user role is: {role}

Your job is to classify the user's message into exactly one intent.

Allowed intents:
- refresh_candidates
- offboarding_risk
- data_quality_audit
- license_utilization
- clarification_needed
- unsupported
- out_of_scope

Intent definitions:

refresh_candidates:
The user wants to find laptops/devices/assets due for refresh, replacement, renewal, upgrade, or lifecycle review.

offboarding_risk:
The user wants to find terminated/former employees who still have assigned assets, devices, software licenses, access, or active assignments.

data_quality_audit:
The user wants to find missing, incomplete, dirty, invalid, or low-quality asset/inventory records.

license_utilization:
The user wants to find underused software licenses, unused seats, low utilization, subscription waste, or license cost savings.

clarification_needed:
The user is asking something related to asset intelligence, but the request is too vague to safely choose one analytics task.

unsupported:
The user is asking for something in the asset intelligence domain, but it is not one of the currently supported analytics tasks.

out_of_scope:
The user is asking for something outside company asset, software license, maintenance, warranty, inventory, or lifecycle analytics.

Return only valid JSON. Do not include markdown.

JSON shape:
{{
  "intent": "one_allowed_intent",
  "confidence": 0.0,
  "reason": "short reason",
  "clarifying_question": "question if clarification_needed, otherwise null"
}}

Examples:

User: Which laptops are due for replacement soon?
Response:
{{
  "intent": "refresh_candidates",
  "confidence": 0.95,
  "reason": "The user asks for laptops due for replacement.",
  "clarifying_question": null
}}

User: Are we wasting money on unused software seats?
Response:
{{
  "intent": "license_utilization",
  "confidence": 0.93,
  "reason": "The user asks about unused software seats and cost waste.",
  "clarifying_question": null
}}

User: Show risky assets.
Response:
{{
  "intent": "clarification_needed",
  "confidence": 0.74,
  "reason": "The request mentions risk but does not specify lifecycle, data quality, offboarding, or license utilization.",
  "clarifying_question": "Do you mean refresh risk, offboarding risk, data quality risk, or software license utilization risk?"
}}

User: Write me a poem.
Response:
{{
  "intent": "out_of_scope",
  "confidence": 0.99,
  "reason": "The user asks for creative writing outside asset intelligence.",
  "clarifying_question": null
}}
"""

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_message},
            ],
            temperature=0,
        )

        content = completion.choices[0].message.content or ""
        parsed = self._parse_json_object(content)

        allowed_intents = {
            "refresh_candidates",
            "offboarding_risk",
            "data_quality_audit",
            "license_utilization",
            "clarification_needed",
            "unsupported",
            "out_of_scope",
        }

        intent = parsed.get("intent")
        if intent not in allowed_intents:
            raise ValueError(f"Invalid classified intent: {intent}")

        confidence = parsed.get("confidence", 0)
        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.0

        return {
            "intent": intent,
            "confidence": max(0.0, min(confidence, 1.0)),
            "reason": str(parsed.get("reason") or "No reason provided."),
            "clarifying_question": parsed.get("clarifying_question"),
        }

    def _parse_json_object(self, content: str) -> dict[str, Any]:
        try:
            parsed = json.loads(content)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in model response.")

        parsed = json.loads(match.group(0))
        if not isinstance(parsed, dict):
            raise ValueError("Model response JSON is not an object.")

        return parsed