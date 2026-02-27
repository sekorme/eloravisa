"use client"

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

interface Props {
  data: number[]
  labels?: string[]
  prefix?: string
}

export default function MonthlyBarChart({ data, labels, prefix = '' }: Props) {
  // defensive: ensure we have an array of 12 (or at least something)
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []
    return data.map((v, i) => ({
      name: labels?.[i] ?? `M${i + 1}`,
      value: Number(v) || 0,
    }))
  }, [data, labels])

  const max = Math.max(...(data.length ? data : [1]), 1)

  if (!chartData.length) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.06} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v: any) => (prefix ? `${prefix}${v}` : String(v))} axisLine={false} tickLine={false} />
          <Tooltip
            // use permissive any types to satisfy the library's expected signature
            formatter={(value: any) => (prefix ? `${prefix}${Number(value).toFixed(2)}` : Number(value).toFixed(2))}
            labelFormatter={(label: any) => String(label)}
            wrapperStyle={{ borderRadius: 8, boxShadow: '0 6px 20px rgba(2,6,23,0.2)' }}
          />
          <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value === max ? '#0ea5a4' : '#06b6d4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
