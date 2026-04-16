from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.app_env,
    }