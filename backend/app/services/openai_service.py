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
- Do not claim to query live database data yet.
- If the user asks for analytics, explain that backend query execution will be added next.
- Stay within the asset intelligence domain.
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