import { MetricCard } from "@/components/results/metric-card"
import type { RefreshCandidatesData } from "@/types/chat"

interface ResultSummaryCardsProps {
  data: RefreshCandidatesData
}

function getOverdueCount(data: RefreshCandidatesData) {
  return data.results.filter(
    (row) => row.days_until_refresh !== null && row.days_until_refresh < 0,
  ).length
}

function getOfficeCount(data: RefreshCandidatesData) {
  return new Set(data.results.map((row) => row.office_name)).size
}

function getWorstTiming(data: RefreshCandidatesData) {
  const values = data.results
    .map((row) => row.days_until_refresh)
    .filter((value): value is number => value !== null)

  if (values.length === 0) return "—"

  const minValue = Math.min(...values)

  if (minValue < 0) return `Overdue by ${Math.abs(minValue)}d`
  if (minValue === 0) return "Due today"
  return `Due in ${minValue}d`
}

export function ResultSummaryCards({ data }: ResultSummaryCardsProps) {
  const cards = [
    {
      label: "Total candidates",
      value: String(data.total_candidates),
    },
    {
      label: "Offices impacted",
      value: String(getOfficeCount(data)),
    },
    {
      label: "Overdue",
      value: String(getOverdueCount(data)),
    },
    {
      label: "Most urgent",
      value: getWorstTiming(data),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <MetricCard key={card.label} label={card.label} value={card.value} />
      ))}
    </div>
  )
}