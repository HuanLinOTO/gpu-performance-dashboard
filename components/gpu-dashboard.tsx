"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useGPUData, useFilteredData } from "@/hooks/use-gpu-data"
import { useLanguage } from "@/hooks/use-language"
import { useTranslation } from "@/lib/i18n"
import type { FilterOptions, SortField, SortDirection } from "@/lib/types"
import { PerformanceTable } from "./performance-table"
import { PerformanceStats } from "./performance-stats"
import { FilterControls } from "./filter-controls"
import { PlatformAnalytics } from "./platform-analytics"
import { LanguageToggle } from "./language-toggle"
import { FriendLinks } from "./friend-links"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Database, BarChart3, TrendingUp } from "lucide-react"

export function GPUDashboard() {
  const { data, platformStats, loading, error, lastUpdated, refetch } = useGPUData()
  const { language } = useLanguage()
  const t = useTranslation(language)

  // Debug: Log language changes
  console.log("GPUDashboard rendered with language:", language)

  const [filters, setFilters] = useState<FilterOptions>({
    platforms: [],
    searchQuery: "",
  })

  const [sortField, setSortField] = useState<SortField>("fp16")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const filteredData = useFilteredData(data, filters, sortField, sortDirection)

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center space-y-4">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
  //         <p className="text-muted-foreground">{t.errors.loadingData}</p>
  //       </div>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">{t.errors.errorLoading}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={refetch}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              {t.actions.tryAgain}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              {/* <img
                src="/favicon.svg"
                alt="GPU Dashboard Logo"
                className="w-10 h-10"
              /> */}
              <div>
                <h1 className="text-3xl font-bold text-balance">{t.dashboard.title}</h1>
                <p className="text-muted-foreground mt-1">{t.dashboard.subtitle}</p>
                <span className="text-xs text-muted-foreground block mt-2">
                  {language === "zh"
                    ? "数据来源："
                    : "Data source: "}
                  <a
                    href="https://github.com/zzc0721/torch-performance-test-data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-500 hover:text-blue-400 ml-1"
                  >
                    https://github.com/zzc0721/torch-performance-test-data
                  </a>
                </span>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <LanguageToggle />
              <Badge variant="outline" className="text-xs">
                {data.length} {t.dashboard.devices}
              </Badge>
              {lastUpdated && (
                <Badge variant="secondary" className="text-xs">
                  {t.dashboard.updated} {lastUpdated.toLocaleTimeString()}
                </Badge>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PerformanceStats data={data} language={language} />
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FilterControls
            data={data}
            filters={filters}
            onFiltersChange={setFilters}
            onRefresh={refetch}
            isLoading={loading}
            language={language}
          />
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Tabs defaultValue="table" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2 transition-all duration-200">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">{t.tabs.table}</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 transition-all duration-200">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{language === "zh" ? "分析与对比" : "Analytics & Comparison"}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.table.performanceData}</h2>
                <Badge variant="outline">
                  {filteredData.length} {t.table.of} {data.length} {t.dashboard.devices}
                </Badge>
              </div>
              <PerformanceTable
                data={filteredData}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                language={language}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{language === "zh" ? "性能分析与对比" : "Performance Analytics & Comparison"}</h2>
                <Badge variant="outline">
                  {language === "zh" ? "综合分析" : "Comprehensive Analysis"}
                </Badge>
              </div>
              <PlatformAnalytics data={data} language={language} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* 友链区域 */}
      <FriendLinks />
    </div>
  )
}
