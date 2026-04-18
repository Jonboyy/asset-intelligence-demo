import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { RefreshCandidatesData } from "@/types/chat"

interface RefreshTimingChartProps {
  data: RefreshCandidatesData
}

function getBucketLabel(daysUntilRefresh: number | null) {
  if (daysUntilRefresh === null) return "Unknown"
  if (daysUntilRefresh < 0) return "Overdue"
  if (daysUntilRefresh <= 30) return "0–30d"
  if (daysUntilRefresh <= 90) return "31–90d"
  return "91d+"
}

const bucketOrder = ["Overdue", "0–30d", "31–90d", "91d+", "Unknown"]

export function RefreshTimingChart({ data }: RefreshTimingChartProps) {
  const chartData = useMemo(() => {
    const counts = new Map<string, number>()

    for (const row of data.results) {
      const bucket = getBucketLabel(row.days_until_refresh)
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1)
    }

    return bucketOrder
      .filter((bucket) => counts.has(bucket))
      .map((bucket) => ({
        bucket,
        count: counts.get(bucket) ?? 0,
      }))
  }, [data.results])

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900">Refresh timing buckets</p>
        <p className="text-sm text-slate-500">
          How urgent the current refresh candidates are.
        </p>
      </div>

      <div className="h-72 w-full text-slate-900">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}