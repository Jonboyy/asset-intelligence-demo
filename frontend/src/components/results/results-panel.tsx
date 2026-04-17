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
import type { ChatResponse } from "@/types/chat"

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

export function ResultsPanel({ result }: ResultsPanelProps) {
  const rows = result?.data?.results ?? []

  return (
    <Card className="h-full border-slate-200/80 shadow-sm">
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

      <CardContent className="space-y-4">
        {result?.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Metric
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {result.data.metric}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total candidates
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {result.data.total_candidates}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
            No structured result yet. Try a refresh-related prompt from the sidebar.
          </div>
        )}
      </CardContent>
    </Card>
  )
}