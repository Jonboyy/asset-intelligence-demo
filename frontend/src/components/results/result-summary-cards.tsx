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
  const overdueCount = getOverdueCount(data)
  const officeCount = getOfficeCount(data)
  const mostUrgent = getWorstTiming(data)

  const cards = [
    {
      label: "Total candidates",
      value: String(data.total_candidates),
    },
    {
      label: "Offices impacted",
      value: String(officeCount),
    },
    {
      label: "Overdue",
      value: String(overdueCount),
    },
    {
      label: "Most urgent",
      value: mostUrgent,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="mt-2 whitespace-normal text-lg font-semibold leading-6 text-slate-900 [hyphens:auto]">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}