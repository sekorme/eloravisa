"use client"

import React from 'react'

interface Props {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

export default function Sparkline({ data, width = 120, height = 32, stroke = '#06b6d4', fill = 'transparent' }: Props) {
  if (!data || data.length === 0) return <svg width={width} height={height} />

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const areaPath = `M0,${height} L${points.split(' ').join(' L ')} L${width},${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={areaPath} fill={fill} opacity={0.08} />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

