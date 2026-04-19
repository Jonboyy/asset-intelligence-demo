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
import type { LicenseUtilizationData } from "@/types/chat"

interface LicenseUtilizationResultsProps {
  data: LicenseUtilizationData
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function LicenseUtilizationCharts({ data }: LicenseUtilizationResultsProps) {
  const unusedCostData = useMemo(() => {
    return data.results
      .map((row) => ({
        product: row.product_name,
        cost: row.estimated_unused_cost,
      }))
      .sort((a, b) => b.cost - a.cost)
  }, [data.results])

  const utilizationData = useMemo(() => {
    return data.results
      .map((row) => ({
        product: row.product_name,
        utilization: row.utilization_percent,
      }))
      .sort((a, b) => a.utilization - b.utilization)
  }, [data.results])

  const chartHeight = Math.max(260, data.results.length * 46)

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Estimated unused cost</p>
          <p className="text-sm text-slate-500">
            Annual cost estimate for unused purchased seats.
          </p>
        </div>

        <div className="w-full text-slate-900" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={unusedCostData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="product"
                width={150}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="cost" radius={[0, 8, 8, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Utilization percentage</p>
          <p className="text-sm text-slate-500">
            Products below the configured utilization threshold.
          </p>
        </div>

        <div className="w-full text-slate-900" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={utilizationData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="product"
                width={150}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="utilization" radius={[0, 8, 8, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function LicenseUtilizationResults({ data }: LicenseUtilizationResultsProps) {
  const cards = [
    {
      label: "Products flagged",
      value: String(data.total_products_flagged),
    },
    {
      label: "Unused seats",
      value: String(data.total_unused_seats),
    },
    {
      label: "Unused annual cost",
      value: formatCurrency(data.estimated_total_unused_cost),
    },
    {
      label: "Lowest utilization",
      value: `${data.lowest_utilization_percent}%`,
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
            {data.total_products_flagged}
          </span>{" "}
          software product{data.total_products_flagged === 1 ? "" : "s"} below the{" "}
          <span className="font-semibold text-slate-900">
            {data.threshold_percent}%
          </span>{" "}
          utilization threshold.
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

      <LicenseUtilizationCharts data={data} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Unused</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Annual Cost</TableHead>
              <TableHead>Unused Cost</TableHead>
              <TableHead>Renewal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((row) => (
              <TableRow key={row.product_name}>
                <TableCell className="font-medium">
                  <div className="min-w-40 whitespace-normal [hyphens:auto]">
                    {row.product_name}
                  </div>
                </TableCell>
                <TableCell>{row.vendor_name}</TableCell>
                <TableCell>{row.license_type}</TableCell>
                <TableCell>{row.total_seats}</TableCell>
                <TableCell>{row.assigned_seats}</TableCell>
                <TableCell>{row.unused_seats}</TableCell>
                <TableCell>{row.utilization_percent}%</TableCell>
                <TableCell>{formatCurrency(row.annual_cost)}</TableCell>
                <TableCell>{formatCurrency(row.estimated_unused_cost)}</TableCell>
                <TableCell>{formatDate(row.renewal_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}