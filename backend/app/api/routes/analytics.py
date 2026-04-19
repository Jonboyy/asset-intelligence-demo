import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.analytics import (
    DataQualityAuditResponse,
    LicenseUtilizationResponse,
    OffboardingRiskResponse,
    RefreshCandidatesRequest,
    RefreshCandidatesResponse,
)
from app.services.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)

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
        logger.exception("Refresh candidates request failed")
        raise HTTPException(
            status_code=500,
            detail="Refresh candidates request failed. Please check the backend logs.",
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
        logger.exception("Offboarding risk request failed")
        raise HTTPException(
            status_code=500,
            detail="Offboarding risk request failed. Please check the backend logs.",
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
        logger.exception("Data quality audit request failed")
        raise HTTPException(
            status_code=500,
            detail="Data quality audit request failed. Please check the backend logs.",
        ) from exc


@router.get("/license-utilization", response_model=LicenseUtilizationResponse)
def get_license_utilization(
    db: Session = Depends(get_db),
) -> LicenseUtilizationResponse:
    try:
        service = AnalyticsService()
        result = service.get_license_utilization(db=db)
        return LicenseUtilizationResponse(**result)
    except Exception as exc:
        logger.exception("License utilization request failed")
        raise HTTPException(
            status_code=500,
            detail="License utilization request failed. Please check the backend logs.",
        ) from exc