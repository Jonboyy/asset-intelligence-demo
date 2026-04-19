from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.analytics import (
    DataQualityAuditResponse,
    OffboardingRiskResponse,
    RefreshCandidatesRequest,
    RefreshCandidatesResponse,
)
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


@router.get("/offboarding-risk", response_model=OffboardingRiskResponse)
def get_offboarding_risk(
    db: Session = Depends(get_db),
) -> OffboardingRiskResponse:
    try:
        service = AnalyticsService()
        result = service.get_offboarding_risk(db=db)
        return OffboardingRiskResponse(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Offboarding risk request failed: {exc}",
        ) from exc


@router.get("/data-quality-audit", response_model=DataQualityAuditResponse)
def get_data_quality_audit(
    db: Session = Depends(get_db),
) -> DataQualityAuditResponse:
    try:
        service = AnalyticsService()
        result = service.get_data_quality_audit(db=db)
        return DataQualityAuditResponse(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Data quality audit request failed: {exc}",
        ) from exc