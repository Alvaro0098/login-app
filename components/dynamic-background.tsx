"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

export type MetricStatus = "positive" | "neutral" | "negative" | "warning"

interface DynamicBackgroundProps {
  children: ReactNode
  metricStatus: MetricStatus
  intensity?: number // 0-100, how intense the color should be
  animated?: boolean
}

export function DynamicBackground({ children, metricStatus, intensity = 70, animated = true }: DynamicBackgroundProps) {
  // Normalize intensity to be between 0 and 100
  const normalizedIntensity = Math.max(0, Math.min(100, intensity))

  // Calculate opacity based on intensity (0.5 to 0.9)
  const baseOpacity = 0.5 + (normalizedIntensity / 100) * 0.4

  // Define color schemes for different metric statuses
  const colorSchemes = {
    positive: {
      from: `from-emerald-500/${baseOpacity}`,
      via: `via-teal-500/${baseOpacity - 0.1}`,
      to: `to-cyan-500/${baseOpacity - 0.2}`,
    },
    neutral: {
      from: `from-indigo-500/${baseOpacity}`,
      via: `via-purple-500/${baseOpacity - 0.1}`,
      to: `to-pink-500/${baseOpacity - 0.2}`,
    },
    negative: {
      from: `from-slate-700/${baseOpacity}`,
      via: `via-blue-800/${baseOpacity - 0.1}`,
      to: `to-slate-900/${baseOpacity - 0.2}`,
    },
    warning: {
      from: `from-amber-500/${baseOpacity}`,
      via: `via-orange-500/${baseOpacity - 0.1}`,
      to: `to-rose-500/${baseOpacity - 0.2}`,
    },
  }

  // Get the current color scheme
  const currentScheme = colorSchemes[metricStatus]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {animated ? (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${currentScheme.from} ${currentScheme.via} ${currentScheme.to}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          key={metricStatus} // This forces re-render when metricStatus changes
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentScheme.from} ${currentScheme.via} ${currentScheme.to}`}
        />
      )}
      {children}
    </div>
  )
}
