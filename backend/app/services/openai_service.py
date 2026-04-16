from openai import OpenAI

from app.config import get_settings


class OpenAIService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.openai_model
        self.client = OpenAI(api_key=settings.openai_api_key)

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
- Do not claim to query live database data yet.
- If the user asks for analytics, explain that backend query execution will be added next.
- Stay within the asset intelligence domain.
"""

        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )

        return response.output_text.strip()