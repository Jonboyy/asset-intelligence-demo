import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataQualityResults } from "@/components/results/data-quality-results"
import { LicenseUtilizationResults } from "@/components/results/license-utilization-results"
import { OffboardingRiskResults } from "@/components/results/offboarding-risk-results"
import { RefreshByOfficeChart } from "@/components/results/refresh-by-office-chart"
import { RefreshTimingChart } from "@/components/results/refresh-timing-chart"
import { ResultSummaryCards } from "@/components/results/result-summary-cards"
import type { ChatResponse, RefreshCandidatesData } from "@/types/chat"

interface ResultsPanelProps {
  result: ChatResponse | null
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function formatDays(value: number | null) {
  if (value === null) return "—"
  if (value < 0) return `Overdue by ${Math.abs(value)}d`
  if (value === 0) return "Due today"
  return `${value}d`
}

function RefreshCandidatesResults({ data }: { data: RefreshCandidatesData }) {
  const rows = data.results

  return (
    <>
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Summary
        </p>
        <p className="mt-2 whitespace-normal text-sm leading-6 text-slate-700 [hyphens:auto]">
          Found <span className="font-semibold text-slate-900">{data.total_candidates}</span>{" "}
          laptop refresh candidates within the next{" "}
          <span className="font-semibold text-slate-900">{data.days_ahead}</span> days.
        </p>
      </div>

      <ResultSummaryCards data={data} />

      <div className="grid grid-cols-1 gap-4">
        <RefreshByOfficeChart data={data} />
        <RefreshTimingChart data={data} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Office</TableHead>
              <TableHead>Asset Tag</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Purchase</TableHead>
              <TableHead>Refresh Due</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.asset_tag}>
                <TableCell>{row.office_name}</TableCell>
                <TableCell className="font-medium">{row.asset_tag}</TableCell>
                <TableCell>
                  {row.manufacturer} {row.model}
                </TableCell>
                <TableCell>{formatDate(row.purchase_date)}</TableCell>
                <TableCell>{formatDate(row.refresh_due_date)}</TableCell>
                <TableCell>{formatDays(row.days_until_refresh)}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.condition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const data = result?.data

  return (
    <Card className="flex h-auto min-h-[520px] flex-col border-slate-200/80 shadow-sm xl:h-full xl:min-h-0">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Results</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{result?.mode ?? "idle"}</Badge>
            <Badge variant="outline">{result?.task ?? "no-task"}</Badge>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Structured result payload returned by the backend.
        </p>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-visible xl:overflow-y-auto">
        {data ? (
          data.metric === "offboarding_risk" ? (
            <OffboardingRiskResults data={data} />
          ) : data.metric === "data_quality_audit" ? (
            <DataQualityResults data={data} />
          ) : data.metric === "license_utilization" ? (
            <LicenseUtilizationResults data={data} />
          ) : (
            <RefreshCandidatesResults data={data} />
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
            No structured result yet. Try one of the supported prompts from the sidebar, such as:
            <div className="mt-3 rounded-xl bg-white p-3 text-slate-700">
              “Which laptops are likely due for refresh soon?”
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}