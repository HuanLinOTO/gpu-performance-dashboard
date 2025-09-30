"use client"

import type { GPUPerformanceData, Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeviceName } from "./device-name"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getTopPerformers } from "@/lib/data-utils"
import { Trophy, Zap, TrendingUp } from "lucide-react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PlatformAnalyticsProps {
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

interface DevicePlatformComparison {
  device: string
  originalNames: string[]
  platforms: {
    [platform: string]: {
      fp32: number
      fp16: number
      bf16: number
      count: number
    }
  }
}

// 标准化设备名称的函数
function normalizeDeviceName(deviceName: string): string {
  return deviceName
    .toLowerCase()
    // 移除 NVIDIA 前缀
    .replace(/^nvidia\s+/i, '')
    // 统一 RTX 格式
    .replace(/rtx\s*(\d+)/i, 'rtx$1')
    // 统一容量格式 (g/gb -> g, G -> g)
    .replace(/(\d+)\s*gb?\b/gi, '$1g')
    .replace(/(\d+)\s*G\b/g, '$1g')
    // 移除多余空格和特殊字符
    .replace(/[\s\-_]+/g, '')
    // 统一 laptop 标记
    .replace(/laptop/gi, 'laptop')
    // 移除一些变体标记
    .replace(/\b(ti|super|d)\b/gi, (match) => match.toLowerCase())
    .trim()
}

// 从标准化的名称推断平台类型
function inferPlatformFromNote(note: string, contributor: string): string {
  const noteAndContributor = (note + ' ' + contributor).toLowerCase()

  if (noteAndContributor.includes('gcp') || noteAndContributor.includes('google cloud')) {
    return 'GCP'
  }
  if (noteAndContributor.includes('docker') || noteAndContributor.includes('容器云')) {
    return 'Docker'
  }
  if (noteAndContributor.includes('ucloud') || noteAndContributor.includes('优云智算')) {
    return 'UCloud'
  }
  if (noteAndContributor.includes('aigate') || noteAndContributor.includes('智算云扉')) {
    return 'AIGate'
  }
  if (noteAndContributor.includes('laptop') || noteAndContributor.includes('笔记本')) {
    return 'Laptop'
  }
  if (noteAndContributor.includes('实体机') || noteAndContributor.includes('physical')) {
    return 'Physical Machine'
  }
  return 'Unknown'
}

export function PlatformAnalytics({ data, language }: PlatformAnalyticsProps) {
  const t = useTranslation(language)
  const [selectedDevice, setSelectedDevice] = useState<string>("")

  // 分析数据：找到在多个平台上都有测试的设备
  const deviceComparisons = useMemo(() => {
    const devicePlatformMap: {
      [normalizedDevice: string]: {
        originalNames: Set<string>
        platforms: { [platform: string]: GPUPerformanceData[] }
      }
    } = {}

    // 按标准化设备名称和推断的平台分组
    data.forEach(item => {
      const normalizedDevice = normalizeDeviceName(item.device)
      // 优先使用数据中的平台信息，如果没有则从note推断
      const platform = item.platform || inferPlatformFromNote(item.note, item.contributor)

      // console.log(`Device: "${item.device}" -> Normalized: "${normalizedDevice}", Platform: "${platform}"`)

      if (!devicePlatformMap[normalizedDevice]) {
        devicePlatformMap[normalizedDevice] = {
          originalNames: new Set(),
          platforms: {}
        }
      }

      devicePlatformMap[normalizedDevice].originalNames.add(item.device)

      if (!devicePlatformMap[normalizedDevice].platforms[platform]) {
        devicePlatformMap[normalizedDevice].platforms[platform] = []
      }
      devicePlatformMap[normalizedDevice].platforms[platform].push(item)
    })

    // 处理所有设备（包括单平台的设备）
    const comparisons: DevicePlatformComparison[] = []
    Object.entries(devicePlatformMap).forEach(([normalizedDevice, deviceData]) => {
      const platformKeys = Object.keys(deviceData.platforms)

      // 选择最常见的原始名称作为显示名称
      const originalNamesArray = Array.from(deviceData.originalNames)
      const displayName = originalNamesArray.reduce((a, b) =>
        originalNamesArray.filter(name => name === a).length >=
          originalNamesArray.filter(name => name === b).length ? a : b
      )

      const deviceComparison: DevicePlatformComparison = {
        device: displayName,
        originalNames: originalNamesArray,
        platforms: {}
      }

      platformKeys.forEach(platform => {
        const items = deviceData.platforms[platform]
        const avgFp32 = items.reduce((sum, item) => sum + item.fp32, 0) / items.length
        const avgFp16 = items.reduce((sum, item) => sum + item.fp16, 0) / items.length
        const avgBf16 = items.reduce((sum, item) => sum + item.bf16, 0) / items.length

        deviceComparison.platforms[platform] = {
          fp32: avgFp32,
          fp16: avgFp16,
          bf16: avgBf16,
          count: items.length
        }
      })

      comparisons.push(deviceComparison)
    })

    // 仅在开发环境输出调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${comparisons.length} unique devices:`,
        comparisons.map(c => ({
          device: c.device,
          platforms: Object.keys(c.platforms),
          variants: c.originalNames,
          isMultiPlatform: Object.keys(c.platforms).length > 1
        }))
      );
    }

    return comparisons.sort((a, b) => a.device.localeCompare(b.device))
  }, [data])

  // 准备图表数据
  const chartData = useMemo(() => {
    if (!selectedDevice) return []

    const selectedComparison = deviceComparisons.find(d => d.device === selectedDevice)
    if (!selectedComparison) return []

    return Object.entries(selectedComparison.platforms).map(([platform, stats]) => ({
      platform: t.platforms[platform as keyof typeof t.platforms] || platform,
      FP32: Number(stats.fp32.toFixed(2)),
      FP16: Number(stats.fp16.toFixed(2)),
      BF16: Number(stats.bf16.toFixed(2)),
      count: stats.count
    }))
  }, [selectedDevice, deviceComparisons, t])

  // 如果没有选择设备，默认选择第一个
  const defaultDevice = deviceComparisons.length > 0 ? deviceComparisons[0].device : ""
  const currentDevice = selectedDevice || defaultDevice

  // 计算顶级性能排行
  const topFp16 = useMemo(() => getTopPerformers(data, "fp16", 10), [data])
  const topFp32 = useMemo(() => getTopPerformers(data, "fp32", 5), [data])
  const topBf16 = useMemo(() => getTopPerformers(data, "bf16", 5), [data])

  return (
    <div className="space-y-6">
      {/* 顶级性能排行榜 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {t.charts.topFp16}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topFp16.slice(0, 5).map((device, index) => (
                <motion.div
                  key={`${device.device}-${index}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05 + 0.1,
                    ease: "easeOut"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <DeviceName name={device.device} className="font-medium text-sm truncate max-w-32" />
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
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                {t.charts.topFp32}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topFp32.map((device, index) => (
                <motion.div
                  key={`${device.device}-${index}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05 + 0.25,
                    ease: "easeOut"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-chart-1 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <DeviceName name={device.device} className="font-medium text-sm truncate max-w-32" />
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
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {t.charts.topBf16}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topBf16.map((device, index) => (
                <motion.div
                  key={`${device.device}-${index}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05 + 0.4,
                    ease: "easeOut"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-chart-3 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <DeviceName name={device.device} className="font-medium text-sm truncate max-w-32" />
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
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {deviceComparisons.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {language === "zh"
                  ? "没有找到设备数据"
                  : "No device data found"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 设备选择器 */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {language === "zh" ? "设备平台性能对比" : "Device Performance Across Platforms"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">
                    {language === "zh" ? "选择设备:" : "Select Device:"}
                  </label>
                  <Select value={currentDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger className="w-[320px]">
                      <SelectValue placeholder={language === "zh" ? "选择一个设备" : "Select a device"} />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceComparisons.map(comparison => {
                        const platformCount = Object.keys(comparison.platforms).length
                        const isMultiPlatform = platformCount > 1
                        return (
                          <SelectItem key={comparison.device} value={comparison.device}>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <DeviceName name={comparison.device} className="text-sm" />
                                {isMultiPlatform && (
                                  <Badge variant="secondary" className="text-xs">
                                    {language === "zh" ? "多平台" : "Multi-platform"}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {platformCount} {language === "zh" ? "个平台" : `platform${platformCount !== 1 ? "s" : ""}`}
                                {comparison.originalNames.length > 1 && (
                                  <span className="ml-2">
                                    ({comparison.originalNames.length} {language === "zh" ? "个变体" : "variants"})
                                  </span>
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {currentDevice && (
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const selectedComparison = deviceComparisons.find(d => d.device === currentDevice)
                      const platformCount = Object.keys(selectedComparison?.platforms || {}).length
                      const isMultiPlatform = platformCount > 1

                      if (language === "zh") {
                        return isMultiPlatform
                          ? `已在 ${platformCount} 个平台上测试，可进行跨平台性能对比`
                          : `在 ${platformCount} 个平台上测试`
                      } else {
                        return isMultiPlatform
                          ? `Tested on ${platformCount} platforms, cross-platform comparison available`
                          : `Tested on ${platformCount} platform`
                      }
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 性能对比图表 */}
          {currentDevice && chartData.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {currentDevice} - {language === "zh" ? "平台性能对比" : "Platform Performance Comparison"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="platform"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        label={{
                          value: 'TFLOPS',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(2)} TFLOPS`,
                          name
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="FP32" fill="#3b82f6" name="FP32" />
                      <Bar dataKey="FP16" fill="#10b981" name="FP16" />
                      <Bar dataKey="BF16" fill="#8b5cf6" name="BF16" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 详细统计 */}
          {currentDevice && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {language === "zh" ? "详细统计" : "Detailed Statistics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(deviceComparisons.find(d => d.device === currentDevice)?.platforms || {}).map(([platform, stats]) => (
                    <div key={platform} className="p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-sm font-medium",
                            PLATFORM_BG_COLORS[platform as keyof typeof PLATFORM_BG_COLORS] ||
                            PLATFORM_BG_COLORS.Unknown,
                          )}
                        >
                          {t.platforms[platform as keyof typeof t.platforms] || platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({stats.count} {language === "zh" ? "次测试" : `test${stats.count !== 1 ? "s" : ""}`})
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>FP32:</span>
                          <span className="font-mono">{stats.fp32.toFixed(2)} TFLOPS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FP16:</span>
                          <span className="font-mono">{stats.fp16.toFixed(2)} TFLOPS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>BF16:</span>
                          <span className="font-mono">{stats.bf16.toFixed(2)} TFLOPS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
