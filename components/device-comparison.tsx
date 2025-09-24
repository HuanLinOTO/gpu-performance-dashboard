"use client"

import type { GPUPerformanceData } from "@/lib/types"
import type { Language } from "@/lib/i18n"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getTopPerformers } from "@/lib/data-utils"
import { Trophy, Zap, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeviceComparisonProps {
  data: GPUPerformanceData[]
  language: Language
}

const PLATFORM_COLORS = {
  GCP: "#3b82f6",
  "Physical Machine": "#10b981",
  Laptop: "#8b5cf6",
  Docker: "#f59e0b",
  UCloud: "#06b6d4",
  AIGate: "#ec4899",
  Unknown: "#6b7280",
}

const PLATFORM_BG_COLORS = {
  GCP: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Physical Machine": "bg-green-500/20 text-green-300 border-green-500/30",
  Laptop: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Docker: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  UCloud: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  AIGate: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} TFLOPS
            </p>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function DeviceComparison({ data, language }: DeviceComparisonProps) {
  const t = useTranslation(language)
  const topFp16 = getTopPerformers(data, "fp16", 10)
  const topFp32 = getTopPerformers(data, "fp32", 5)
  const topBf16 = getTopPerformers(data, "bf16", 5)

  const chartData = topFp16.slice(0, 8).map((item) => ({
    device: item.device.length > 15 ? item.device.substring(0, 15) + "..." : item.device,
    fullDevice: item.device,
    fp32: item.fp32,
    fp16: item.fp16,
    bf16: item.bf16,
    platform: item.platform,
  }))

  return (
    <div className="space-y-6">
      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {t.charts.topFp16}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topFp16.slice(0, 5).map((device, index) => (
              <div
                key={`${device.device}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm truncate max-w-32">{device.device}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs mt-1",
                        PLATFORM_BG_COLORS[device.platform as keyof typeof PLATFORM_BG_COLORS] ||
                        PLATFORM_BG_COLORS.Unknown,
                      )}
                    >
                      {t.platforms[device.platform as keyof typeof t.platforms] || device.platform}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{device.fp16.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">TFLOPS</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              {t.charts.topFp32}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topFp32.map((device, index) => (
              <div
                key={`${device.device}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-chart-1 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm truncate max-w-32">{device.device}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs mt-1",
                        PLATFORM_BG_COLORS[device.platform as keyof typeof PLATFORM_BG_COLORS] ||
                        PLATFORM_BG_COLORS.Unknown,
                      )}
                    >
                      {t.platforms[device.platform as keyof typeof t.platforms] || device.platform}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{device.fp32.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">TFLOPS</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {t.charts.topBf16}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBf16.map((device, index) => (
              <div
                key={`${device.device}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-chart-3 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm truncate max-w-32">{device.device}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs mt-1",
                        PLATFORM_BG_COLORS[device.platform as keyof typeof PLATFORM_BG_COLORS] ||
                        PLATFORM_BG_COLORS.Unknown,
                      )}
                    >
                      {t.platforms[device.platform as keyof typeof t.platforms] || device.platform}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{device.bf16.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">TFLOPS</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Device Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="device"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar dataKey="fp32" fill="hsl(var(--chart-1))" name="FP32" radius={[2, 2, 0, 0]} />
                <Bar dataKey="fp16" fill="hsl(var(--chart-2))" name="FP16" radius={[2, 2, 0, 0]} />
                <Bar dataKey="bf16" fill="hsl(var(--chart-3))" name="BF16" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
