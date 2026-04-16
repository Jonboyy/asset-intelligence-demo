from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.openai_service import OpenAIService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        service = OpenAIService()
        reply = service.generate_reply(
            user_message=request.message,
            role=request.role,
        )
        return ChatResponse(reply=reply, model=service.model)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat request failed: {exc}") from exc