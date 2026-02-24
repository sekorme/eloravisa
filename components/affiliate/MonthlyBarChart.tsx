"use client"

import React from 'react'

interface Props {
  data: number[]
  labels?: string[]
}

export default function MonthlyBarChart({ data, labels }: Props) {
  const max = Math.max(...data, 1)
  return (
    <div className="w-full">
      <div className="flex gap-2 items-end h-36">
        {data.map((v, i) => {
          const h = Math.max(2, Math.round((v / max) * 100))
          return (
            <div key={i} className="flex-1">
              <div className="h-full flex items-end">
                <div className="mx-auto w-5 bg-primary rounded-t-md" style={{ height: `${h}%` }} />
              </div>
              <div className="text-xs text-center mt-2 text-muted-foreground">{labels?.[i] ?? ''}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

