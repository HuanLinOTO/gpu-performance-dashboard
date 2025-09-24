"use client"

import type React from "react"
import type { GPUPerformanceData, SortField, SortDirection, Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { ContributorCell } from "./contributor-cell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

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

function PerformanceBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono w-16 text-right">{value.toFixed(2)}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-24">
        <div className={cn("h-full transition-all duration-300", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export function PerformanceTable({ data, sortField, sortDirection, onSort, language }: PerformanceTableProps) {
  const t = useTranslation(language)

  const maxValues = {
    fp32: Math.max(...data.map((d) => d.fp32)),
    fp16: Math.max(...data.map((d) => d.fp16)),
    bf16: Math.max(...data.map((d) => d.bf16)),
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-balance">
          {language === "zh" ? "性能基准测试" : "Performance Benchmarks"}
        </CardTitle>
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
                <TableRow
                  key={`${item.device}-${index}`}
                  className="border-border/30 hover:bg-accent/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="font-mono text-sm">{item.device}</div>
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
                    <PerformanceBar value={item.fp32} max={maxValues.fp32} color="bg-chart-1" />
                  </TableCell>
                  <TableCell>
                    <PerformanceBar value={item.fp16} max={maxValues.fp16} color="bg-chart-2" />
                  </TableCell>
                  <TableCell>
                    <PerformanceBar value={item.bf16} max={maxValues.bf16} color="bg-chart-3" />
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">{item.note}</div>
                  </TableCell>
                  <TableCell>
                    <ContributorCell contributor={item.contributor} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
