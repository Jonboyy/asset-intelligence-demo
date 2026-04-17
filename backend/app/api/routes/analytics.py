from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.analytics import RefreshCandidatesRequest, RefreshCandidatesResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/refresh-candidates", response_model=RefreshCandidatesResponse)
def get_refresh_candidates(
    request: RefreshCandidatesRequest,
    db: Session = Depends(get_db),
) -> RefreshCandidatesResponse:
    try:
        service = AnalyticsService()
        result = service.get_refresh_candidates(db=db, days_ahead=request.days_ahead)
        return RefreshCandidatesResponse(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analytics request failed: {exc}",
        ) from exc