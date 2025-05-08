"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { MetricStatus } from "./dynamic-background"

const metricCardVariants = cva(
  "transition-all duration-300 backdrop-blur-sm border-0 shadow-md hover:shadow-lg h-full",
  {
    variants: {
      status: {
        positive: "bg-emerald-500/20 hover:bg-emerald-500/30",
        neutral: "bg-indigo-500/20 hover:bg-indigo-500/30",
        negative: "bg-slate-700/20 hover:bg-slate-700/30",
        warning: "bg-amber-500/20 hover:bg-amber-500/30",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  },
)

interface MetricCardProps extends VariantProps<typeof metricCardVariants> {
  title: string
  value: string | number
  icon: ReactNode
  trend?: number // Percentage change
  onClick?: () => void
  className?: string
}

export function MetricCard({ title, value, icon, trend, status, onClick, className }: MetricCardProps) {
  // Determine trend status
  const trendStatus: MetricStatus =
    trend === undefined
      ? "neutral"
      : trend > 10
        ? "positive"
        : trend < 0
          ? "negative"
          : trend > 5
            ? "warning"
            : "neutral"

  // Use the provided status or derive from trend
  const cardStatus = status || trendStatus

  return (
    <Card className={cn(metricCardVariants({ status: cardStatus }), className)} onClick={onClick}>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <div
          className={cn(
            "p-3 rounded-full mb-4",
            status === "positive"
              ? "bg-emerald-100 text-emerald-600"
              : status === "negative"
                ? "bg-slate-200 text-slate-700"
                : status === "warning"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-white/90 text-indigo-500",
          )}
        >
          {icon}
        </div>
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="text-2xl font-bold mt-2 text-white">{value}</p>
        {trend !== undefined && (
          <div
            className={cn(
              "mt-2 text-sm font-medium flex items-center",
              trend > 0 ? "text-emerald-300" : trend < 0 ? "text-red-300" : "text-gray-300",
            )}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
