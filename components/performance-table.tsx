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
import { useState } from "react"

interface PerformanceTableProps {
  data: GPUPerformanceData[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  language: Language
}

const PLATFORM_COLORS = {
  GCP: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Physical Machine": "bg-green-500/20 text-green-300 border-green-500/30",
  Laptop: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Docker: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  UCloud: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  AIGate: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

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
    percentage = Math.min((value / max) * 100, 100)
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

  const maxValues = {
    fp32: Math.max(...data.map((d) => d.fp32)),
    fp16: Math.max(...data.map((d) => d.fp16)),
    bf16: Math.max(...data.map((d) => d.bf16)),
  }

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
                <TableHead className="w-[140px]">
                  <SortButton field="fp32" currentField={sortField} direction={sortDirection} onSort={onSort}>
                    FP32
                  </SortButton>
                </TableHead>
                <TableHead className="w-[140px]">
                  <SortButton field="fp16" currentField={sortField} direction={sortDirection} onSort={onSort}>
                    FP16
                  </SortButton>
                </TableHead>
                <TableHead className="w-[140px]">
                  <SortButton field="bf16" currentField={sortField} direction={sortDirection} onSort={onSort}>
                    BF16
                  </SortButton>
                </TableHead>
                <TableHead className="min-w-[200px]">{language === "zh" ? "环境" : "Environment"}</TableHead>
                <TableHead className="w-[140px]">{t.table.contributor}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
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
                      )}
                    >
                      {t.platforms[item.platform as keyof typeof t.platforms] || item.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <PerformanceBar value={item.fp32} max={maxValues.fp32} color="bg-chart-1" useLogScale={useLogScale} index={index * 3 + 0} />
                  </TableCell>
                  <TableCell>
                    <PerformanceBar value={item.fp16} max={maxValues.fp16} color="bg-chart-2" useLogScale={useLogScale} index={index * 3 + 1} />
                  </TableCell>
                  <TableCell>
                    <PerformanceBar value={item.bf16} max={maxValues.bf16} color="bg-chart-3" useLogScale={useLogScale} index={index * 3 + 2} />
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">{item.note}</div>
                  </TableCell>
                  <TableCell>
                    <ContributorCell contributor={item.contributor} />
                  </TableCell>
                </AnimatedTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
