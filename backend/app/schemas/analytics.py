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