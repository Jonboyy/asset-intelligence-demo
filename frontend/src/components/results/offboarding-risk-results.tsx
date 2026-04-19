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

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OffboardingRiskData } from "@/types/chat"

interface OffboardingRiskResultsProps {
  data: OffboardingRiskData
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function formatList(value: string) {
  return value.trim() ? value : "—"
}

function formatRiskLabel(value: string) {
  if (value === "high") return "High"
  if (value === "medium") return "Medium"
  if (value === "low") return "Low"
  return value
}

function OffboardingRiskCharts({ data }: OffboardingRiskResultsProps) {
  const riskLevelData = useMemo(() => {
    const counts = new Map<string, number>()

    for (const row of data.results) {
      const label = formatRiskLabel(row.risk_level)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }

    return ["High", "Medium", "Low"]
      .filter((level) => counts.has(level))
      .map((level) => ({
        level,
        count: counts.get(level) ?? 0,
      }))
  }, [data.results])

  const exposureData = [
    {
      type: "Active assets",
      count: data.total_active_assets,
    },
    {
      type: "Active licenses",
      count: data.total_active_licenses,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Risk level breakdown</p>
          <p className="text-sm text-slate-500">
            Terminated employee cases grouped by risk level.
          </p>
        </div>

        <div className="h-64 w-full text-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskLevelData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Active exposure</p>
          <p className="text-sm text-slate-500">
            Active assignments still linked to terminated employees.
          </p>
        </div>

        <div className="h-64 w-full text-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exposureData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function OffboardingRiskResults({ data }: OffboardingRiskResultsProps) {
  const cards = [
    {
      label: "Employees at risk",
      value: String(data.total_risks),
    },
    {
      label: "High-risk cases",
      value: String(data.high_risk_count),
    },
    {
      label: "Active assets",
      value: String(data.total_active_assets),
    },
    {
      label: "Active licenses",
      value: String(data.total_active_licenses),
    },
  ]

  return (
    <>
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Summary
        </p>
        <p className="mt-2 whitespace-normal text-sm leading-6 text-slate-700 [hyphens:auto]">
          Found{" "}
          <span className="font-semibold text-slate-900">{data.total_risks}</span>{" "}
          terminated employee case{data.total_risks === 1 ? "" : "s"} with active
          asset or software license assignments.
        </p>
      </div>

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

      <OffboardingRiskCharts data={data} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Terminated</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Licenses</TableHead>
              <TableHead>Active asset details</TableHead>
              <TableHead>Active license details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((row) => (
              <TableRow key={row.employee_code}>
                <TableCell>
                  <Badge variant={row.risk_level === "high" ? "default" : "outline"}>
                    {formatRiskLabel(row.risk_level)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="min-w-36 whitespace-normal [hyphens:auto]">
                    {row.full_name}
                  </div>
                  <div className="text-xs text-slate-500">{row.employee_code}</div>
                </TableCell>
                <TableCell>
                  <div className="max-w-52 [overflow-wrap:anywhere]">{row.email}</div>
                </TableCell>
                <TableCell>{row.department_name}</TableCell>
                <TableCell>{row.office_name}</TableCell>
                <TableCell>{formatDate(row.termination_date)}</TableCell>
                <TableCell>{row.active_assets_count}</TableCell>
                <TableCell>{row.active_licenses_count}</TableCell>
                <TableCell>
                  <div className="max-w-72 whitespace-normal text-sm leading-5 [hyphens:auto]">
                    {formatList(row.active_assets)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-72 whitespace-normal text-sm leading-5 [hyphens:auto]">
                    {formatList(row.active_licenses)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}