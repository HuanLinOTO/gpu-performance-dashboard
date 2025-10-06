"use client"

import type React from "react"
import type { GPUPerformanceData, SortField, SortDirection, Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { ContributorCell } from "./contributor-cell"
import { AnimatedTableRow } from "./animated-table-row"
import { DeviceName } from "./device-name"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { handleAdLinkClick, getAdPlatformUrl, type AdPlatform } from "@/lib/ad-utils"

interface PerformanceTableProps {
  data: GPUPerformanceData[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  language: Language
}

const PLATFORM_COLORS = {
  GCP: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Google Colab": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Kaggle: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Physical Machine": "bg-green-500/20 text-green-300 border-green-500/30",
  Laptop: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Docker: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  UCloud: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  AIGate: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  OpenI: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

type MetricKey = "fp32" | "tf32" | "fp16" | "bf16"

const METRIC_CONFIGS: Array<{
  key: MetricKey
  label: string
  sortField: Extract<SortField, MetricKey>
  color: string
}> = [
    { key: "fp32", label: "FP32", sortField: "fp32", color: "bg-chart-1" },
    { key: "tf32", label: "TF32", sortField: "tf32", color: "bg-chart-4" },
    { key: "fp16", label: "FP16", sortField: "fp16", color: "bg-chart-2" },
    { key: "bf16", label: "BF16", sortField: "bf16", color: "bg-chart-3" },
  ]

function SortButton({
  field,
  currentField,
  direction,
  onSort,
  children,
}: {
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
  children: React.ReactNode
}) {
  const isActive = currentField === field

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs font-medium hover:bg-accent/50"
      onClick={() => onSort(field)}
    >
      {children}
      {isActive ? (
        direction === "asc" ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  )
}

function PerformanceBar({
  value,
  max,
  color,
  useLogScale = false,
  index = 0
}: {
  value: number;
  max: number;
  color: string;
  useLogScale?: boolean;
  index?: number;
}) {
  let percentage: number

  if (useLogScale) {
    // 对数刻度：使用 log10，避免 0 值问题
    const logValue = value > 0 ? Math.log10(value) : 0
    const logMax = max > 0 ? Math.log10(max) : 1
    percentage = Math.min((logValue / logMax) * 100, 100)
  } else {
    // 线性刻度
    percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  }

  return (
    <div className="flex items-center gap-2">
      <motion.span
        className="text-sm font-mono w-16 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.02 + 0.1 }}
      >
        {value.toFixed(2)}
      </motion.span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-24">
        <motion.div
          className={cn("h-full", color)}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.6,
            delay: index * 0.02 + 0.15,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  )
}

export function PerformanceTable({ data, sortField, sortDirection, onSort, language }: PerformanceTableProps) {
  const t = useTranslation(language)
  const [useLogScale, setUseLogScale] = useState(false)

  // 检查是否应该显示 FP8 列 - 只要有至少一条数据定义了 fp8 属性(即使值为 undefined),就显示该列
  // 这样即使数据为空,只要数据结构支持 FP8,就会显示该列
  // const hasFp8Column = data.some(d => 'fp8' in d) || data.length === 0
  const hasFp8Column = false // 暂时隐藏 FP8 列

  // 获取有效的 FP8 数据用于计算最大值
  const fp8Values = data.filter(d => d.fp8 !== undefined && !isNaN(d.fp8) && d.fp8 > 0)
  const metricMaxValues = useMemo(() => {
    return METRIC_CONFIGS.reduce((acc, { key }) => {
      const values = data.map((item) => item[key])
      const max = values.length > 0 ? Math.max(...values) : 0
      acc[key] = Number.isFinite(max) ? max : 0
      return acc
    }, {} as Record<MetricKey, number>)
  }, [data])

  const visibleMetrics = useMemo(() => {
    if (data.length === 0) {
      return METRIC_CONFIGS
    }
    return METRIC_CONFIGS.filter(({ key }) => data.some((item) => item[key] > 0))
  }, [data])

  const fp8Max = fp8Values.length > 0 ? Math.max(...fp8Values.map((d) => d.fp8!)) : 1
  const animationStride = Math.max(visibleMetrics.length + (hasFp8Column ? 1 : 0), 1)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-balance">
            {language === "zh" ? "性能基准测试" : "Performance Benchmarks"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="log-scale"
              checked={useLogScale}
              onCheckedChange={setUseLogScale}
            />
            <Label htmlFor="log-scale" className="text-sm">
              {language === "zh" ? "对数刻度" : "Log Scale"}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[200px]">
                  <SortButton field="device" currentField={sortField} direction={sortDirection} onSort={onSort}>
                    {t.table.device}
                  </SortButton>
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortButton field="platform" currentField={sortField} direction={sortDirection} onSort={onSort}>
                    {t.table.platform}
                  </SortButton>
                </TableHead>
                {visibleMetrics.map((metric) => (
                  <TableHead key={metric.key} className="w-[140px]">
                    <SortButton
                      field={metric.sortField}
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={onSort}
                    >
                      {metric.label}
                    </SortButton>
                  </TableHead>
                ))}
                {hasFp8Column && (
                  <TableHead className="w-[140px]">
                    <SortButton field="fp8" currentField={sortField} direction={sortDirection} onSort={onSort}>
                      FP8 E4M3FN
                    </SortButton>
                  </TableHead>
                )}
                <TableHead className="min-w-[200px]">{language === "zh" ? "环境" : "Environment"}</TableHead>
                <TableHead className="w-[140px]">{t.table.contributor}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                const animationBase = index * animationStride

                return (
                  <AnimatedTableRow
                    key={`${item.device}-${index}`}
                    index={index}
                    className="border-border/30 hover:bg-accent/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <DeviceName name={item.device} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          PLATFORM_COLORS[item.platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.Unknown,
                          (item.platform === "UCloud" || item.platform === "AIGate") && "cursor-pointer hover:opacity-80 transition-opacity"
                        )}
                        onClick={(e) => {
                          if (!item.platform) return;
                          const platformMap: Record<string, AdPlatform> = {
                            'UCloud': 'ucloud',
                            'AIGate': 'aigate',
                          };
                          const adPlatform = platformMap[item.platform];
                          if (adPlatform) {
                            const url = getAdPlatformUrl(adPlatform);
                            handleAdLinkClick(adPlatform, 'table', url, e);
                          }
                        }}
                      >
                        {t.platforms[item.platform as keyof typeof t.platforms] || item.platform}
                      </Badge>
                    </TableCell>
                    {visibleMetrics.map((metric, metricIndex) => (
                      <TableCell key={`${metric.key}-${metricIndex}`}>
                        {item[metric.key] > 0 ? (
                          <PerformanceBar
                            value={item[metric.key]}
                            max={metricMaxValues[metric.key]}
                            color={metric.color}
                            useLogScale={useLogScale}
                            index={animationBase + metricIndex}
                          />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">{t.table.empty}</span>
                        )}
                      </TableCell>
                    ))}
                    {hasFp8Column && (
                      <TableCell>
                        {item.fp8 !== undefined && !isNaN(item.fp8) && item.fp8 > 0 ? (
                          <PerformanceBar
                            value={item.fp8}
                            max={fp8Max}
                            color="bg-chart-4"
                            useLogScale={useLogScale}
                            index={animationBase + visibleMetrics.length}
                          />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">{t.table.empty}</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">{item.note}</div>
                    </TableCell>
                    <TableCell>
                      <ContributorCell contributor={item.contributor} />
                    </TableCell>
                  </AnimatedTableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
