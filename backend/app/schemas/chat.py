from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    role: str = Field(default="asset_manager")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "Which laptops are likely due for refresh soon?",
                    "role": "asset_manager",
                }
            ]
        }
    }


class DecisionTrace(BaseModel):
    intent: str | None = None
    confidence: float | None = None
    reason: str | None = None
    selected_task: str | None = None
    mode: str
    model: str
    structured_data_returned: bool


class ChatResponse(BaseModel):
    reply: str
    model: str
    mode: str
    task: str | None = None
    data: dict[str, Any] | None = None
    trace: DecisionTrace | None = None