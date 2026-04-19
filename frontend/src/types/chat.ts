export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export interface RefreshCandidateRow {
  office_name: string
  asset_tag: string
  manufacturer: string
  model: string
  purchase_date: string | null
  refresh_due_date: string | null
  days_until_refresh: number | null
  status: string
  condition: string
}

export interface RefreshCandidatesData {
  metric: "refresh_candidates"
  days_ahead: number
  total_candidates: number
  results: RefreshCandidateRow[]
}

export interface OffboardingRiskRow {
  employee_code: string
  full_name: string
  email: string
  department_name: string
  office_name: string
  termination_date: string | null
  active_assets_count: number
  active_licenses_count: number
  active_assets: string
  active_licenses: string
  risk_level: string
}

export interface OffboardingRiskData {
  metric: "offboarding_risk"
  total_risks: number
  total_active_assets: number
  total_active_licenses: number
  high_risk_count: number
  results: OffboardingRiskRow[]
}

export interface DataQualityAuditRow {
  asset_tag: string
  category_name: string
  manufacturer: string
  model: string
  office_name: string
  status: string
  condition: string
  missing_fields: string
  issue_count: number
}

export interface DataQualityAuditData {
  metric: "data_quality_audit"
  total_assets_with_issues: number
  total_missing_fields: number
  missing_serial_count: number
  missing_purchase_date_count: number
  missing_warranty_count: number
  missing_vendor_count: number
  results: DataQualityAuditRow[]
}

export type AnalyticsData =
  | RefreshCandidatesData
  | OffboardingRiskData
  | DataQualityAuditData

export interface ChatResponse {
  reply: string
  model: string
  mode: string
  task: string | null
  data: AnalyticsData | null
}