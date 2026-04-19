import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.rate_limit import limiter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("10/minute")
def chat(
    request: Request,
    response: Response,
    payload: ChatRequest,
    db: Session = Depends(get_db),
) -> ChatResponse:
    try:
        service = ChatService()
        result = service.handle_message(
            user_message=payload.message,
            role=payload.role,
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