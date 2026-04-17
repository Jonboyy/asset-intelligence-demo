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
  metric: string
  days_ahead: number
  total_candidates: number
  results: RefreshCandidateRow[]
}

export interface ChatResponse {
  reply: string
  model: string
  mode: string
  task: string | null
  data: RefreshCandidatesData | null
}