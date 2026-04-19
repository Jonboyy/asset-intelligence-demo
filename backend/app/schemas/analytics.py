from pydantic import BaseModel, Field


class RefreshCandidatesRequest(BaseModel):
    days_ahead: int = Field(default=180, ge=1, le=3650)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "days_ahead": 180
                }
            ]
        }
    }


class RefreshCandidateRow(BaseModel):
    office_name: str
    asset_tag: str
    manufacturer: str
    model: str
    purchase_date: str | None
    refresh_due_date: str | None
    days_until_refresh: int | None
    status: str
    condition: str


class RefreshCandidatesResponse(BaseModel):
    metric: str
    days_ahead: int
    total_candidates: int
    results: list[RefreshCandidateRow]


class OffboardingRiskRow(BaseModel):
    employee_code: str
    full_name: str
    email: str
    department_name: str
    office_name: str
    termination_date: str | None
    active_assets_count: int
    active_licenses_count: int
    active_assets: str
    active_licenses: str
    risk_level: str


class OffboardingRiskResponse(BaseModel):
    metric: str
    total_risks: int
    total_active_assets: int
    total_active_licenses: int
    high_risk_count: int
    results: list[OffboardingRiskRow]


class DataQualityAuditRow(BaseModel):
    asset_tag: str
    category_name: str
    manufacturer: str
    model: str
    office_name: str
    status: str
    condition: str
    missing_fields: str
    issue_count: int


class DataQualityAuditResponse(BaseModel):
    metric: str
    total_assets_with_issues: int
    total_missing_fields: int
    missing_serial_count: int
    missing_purchase_date_count: int
    missing_warranty_count: int
    missing_vendor_count: int
    results: list[DataQualityAuditRow]