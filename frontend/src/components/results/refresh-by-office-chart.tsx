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

interface RefreshByOfficeChartProps {
  data: RefreshCandidatesData
}

export function RefreshByOfficeChart({ data }: RefreshByOfficeChartProps) {
  const chartData = useMemo(() => {
    const counts = new Map<string, number>()

    for (const row of data.results) {
      counts.set(row.office_name, (counts.get(row.office_name) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([office, count]) => ({
        office,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.office.localeCompare(b.office))
  }, [data.results])

  const chartHeight = Math.max(260, chartData.length * 52)

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900">Refresh candidates by office</p>
        <p className="text-sm text-slate-500">
          Distribution of currently matched laptops across offices.
        </p>
      </div>

      <div className="w-full text-slate-900" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="office"
              width={170}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}