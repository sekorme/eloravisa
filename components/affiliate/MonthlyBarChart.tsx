"use client"

import React from 'react'

interface Props {
  data: number[]
  labels?: string[]
  prefix?: string
}

export default function MonthlyBarChart({ data, labels, prefix = '' }: Props) {
  const max = Math.max(...data, 1)
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-4 items-end h-48 min-w-[600px] md:min-w-full">
        {data.map((v, i) => {
          const h = Math.max(2, Math.round((v / max) * 100))
          const displayValue = prefix ? `${prefix}${v.toFixed(2)}` : v
          return (
            <div key={i} className="flex-1 min-w-[30px] flex flex-col items-center">
              <div className="flex-1 w-full flex items-end justify-center group relative">
                {/* Tooltip or Value on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {displayValue}
                </div>
                <div 
                  className="w-8 md:w-10 bg-primary/80 hover:bg-primary rounded-t-lg transition-all duration-300 ease-in-out shadow-sm" 
                  style={{ height: `${h}%` }} 
                />
              </div>
              <div className="text-[10px] md:text-xs text-center mt-3 text-muted-foreground font-medium truncate w-full">
                {labels?.[i] ?? ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
