import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
) -> ChatResponse:
    try:
        service = ChatService()
        result = service.handle_message(
            user_message=request.message,
            role=request.role,
            db=db,
        )
        return ChatResponse(**result)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Chat request failed")
        raise HTTPException(
            status_code=500,
            detail="Chat request failed. Please try again or check the backend logs.",
        ) from exc