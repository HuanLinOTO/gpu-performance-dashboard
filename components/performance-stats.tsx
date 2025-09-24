"use client"

import type { GPUPerformanceData, Language } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Zap, Cpu, HardDrive } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface PerformanceStatsProps {
  data: GPUPerformanceData[]
  language: Language
}

export function PerformanceStats({ data, language }: PerformanceStatsProps) {
  const t = useTranslation(language)

  console.log("PerformanceStats rendered with language:", language)

  const totalDevices = data.length
  const avgFp16 = data.reduce((sum, d) => sum + d.fp16, 0) / totalDevices
  const topPerformer = data.reduce((max, d) => (d.fp16 > max.fp16 ? d : max), data[0])
  const platformCounts = data.reduce(
    (acc, d) => {
      const platform = d.platform || "Unknown"
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topPlatform = Object.entries(platformCounts).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.totalDevices}</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDevices}</div>
          <p className="text-xs text-muted-foreground">{t.stats.benchmarkedGpus}</p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.avgFp16Performance}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgFp16.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">{t.stats.tflopsAverage}</p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.topPerformer}</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topPerformer?.fp16.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground truncate">{topPerformer?.device}</p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.mostCommonPlatform}</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topPlatform?.[1] || 0}</div>
          <p className="text-xs text-muted-foreground truncate">
            {topPlatform?.[0] ? t.platforms[topPlatform[0] as keyof typeof t.platforms] || topPlatform[0] : "N/A"}{" "}
            {t.stats.devices}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
