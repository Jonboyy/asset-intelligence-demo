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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DataQualityAuditData } from "@/types/chat"

interface DataQualityResultsProps {
  data: DataQualityAuditData
}

function DataQualityCharts({ data }: DataQualityResultsProps) {
  const missingFieldData = [
    {
      field: "Serial",
      count: data.missing_serial_count,
    },
    {
      field: "Purchase date",
      count: data.missing_purchase_date_count,
    },
    {
      field: "Warranty date",
      count: data.missing_warranty_count,
    },
    {
      field: "Vendor",
      count: data.missing_vendor_count,
    },
  ].filter((item) => item.count > 0)

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>()

    for (const row of data.results) {
      counts.set(row.category_name, (counts.get(row.category_name) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
  }, [data.results])

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Missing field breakdown</p>
          <p className="text-sm text-slate-500">
            Count of missing values by audited field.
          </p>
        </div>

        <div className="h-64 w-full text-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missingFieldData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="field" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Issues by asset category</p>
          <p className="text-sm text-slate-500">
            Asset categories with incomplete inventory records.
          </p>
        </div>

        <div className="h-64 w-full text-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid horizontal strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="category"
                width={130}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function DataQualityResults({ data }: DataQualityResultsProps) {
  const cards = [
    {
      label: "Assets with issues",
      value: String(data.total_assets_with_issues),
    },
    {
      label: "Missing fields",
      value: String(data.total_missing_fields),
    },
    {
      label: "Missing serial",
      value: String(data.missing_serial_count),
    },
    {
      label: "Missing vendor",
      value: String(data.missing_vendor_count),
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
          <span className="font-semibold text-slate-900">
            {data.total_assets_with_issues}
          </span>{" "}
          asset record{data.total_assets_with_issues === 1 ? "" : "s"} with missing
          critical inventory data.
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

      <DataQualityCharts data={data} />

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Missing purchase date
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {data.missing_purchase_date_count}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Missing warranty date
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {data.missing_warranty_count}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Tag</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Missing Fields</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((row) => (
              <TableRow key={row.asset_tag}>
                <TableCell className="font-medium">{row.asset_tag}</TableCell>
                <TableCell>{row.category_name}</TableCell>
                <TableCell>
                  <div className="min-w-40 whitespace-normal [hyphens:auto]">
                    {row.manufacturer} {row.model}
                  </div>
                </TableCell>
                <TableCell>{row.office_name}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.condition}</TableCell>
                <TableCell>{row.issue_count}</TableCell>
                <TableCell>
                  <div className="max-w-72 whitespace-normal text-sm leading-5 [overflow-wrap:anywhere]">
                    {row.missing_fields}
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