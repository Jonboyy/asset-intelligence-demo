from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    role: str = Field(default="asset_manager")


class ChatResponse(BaseModel):
    reply: str
    model: str