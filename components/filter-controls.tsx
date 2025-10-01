"use client"

import { useState } from "react"
import type { FilterOptions, GPUPerformanceData, Language } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterControlsProps {
  data: GPUPerformanceData[]
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onRefresh: () => void
  isLoading: boolean
  language: Language
}

const PLATFORM_COLORS = {
  GCP: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Google Colab": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Physical Machine": "bg-green-500/20 text-green-300 border-green-500/30",
  Laptop: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Docker: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  UCloud: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  AIGate: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  OpenI: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

export function FilterControls({
  data,
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
  language,
}: FilterControlsProps) {
  const t = useTranslation(language)
  const [showFilters, setShowFilters] = useState(false)

  // Get unique platforms with counts
  const platformCounts = data.reduce(
    (acc, item) => {
      const platform = item.platform || "Unknown"
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const platforms = Object.entries(platformCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([platform, count]) => ({ platform, count }))

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    const newPlatforms = checked ? [...filters.platforms, platform] : filters.platforms.filter((p) => p !== platform)

    onFiltersChange({
      ...filters,
      platforms: newPlatforms,
    })
  }

  const handleSearchChange = (query: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: query,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      platforms: [],
      searchQuery: "",
    })
  }

  const hasActiveFilters = filters.platforms.length > 0 || filters.searchQuery.length > 0

  return (
    <div className="space-y-4">
      {/* Search and Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.actions.search}
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("border-border/50", showFilters && "bg-accent")}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t.actions.filter}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {filters.platforms.length + (filters.searchQuery ? 1 : 0)}
              </Badge>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="border-border/50 bg-transparent"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            {t.actions.refresh}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              {language === "zh" ? "清除" : "Clear"}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.platforms.map((platform) => (
            <Badge
              key={platform}
              variant="outline"
              className={cn(
                "cursor-pointer hover:bg-destructive/20 hover:border-destructive/50",
                PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.Unknown,
              )}
              onClick={() => handlePlatformToggle(platform, false)}
            >
              {t.platforms[platform as keyof typeof t.platforms] || platform}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.searchQuery && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-destructive/20 hover:border-destructive/50"
              onClick={() => handleSearchChange("")}
            >
              {language === "zh" ? "搜索" : "Search"}: "{filters.searchQuery}"
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              {language === "zh" ? "按平台筛选" : "Filter by Platform"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map(({ platform, count }) => (
                <div key={platform} className="flex items-center space-x-3">
                  <Checkbox
                    id={platform}
                    checked={filters.platforms.includes(platform)}
                    onCheckedChange={(checked) => handlePlatformToggle(platform, checked as boolean)}
                  />
                  <label
                    htmlFor={platform}
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.Unknown,
                      )}
                    >
                      {t.platforms[platform as keyof typeof t.platforms] || platform}
                    </Badge>
                    <span className="text-muted-foreground">({count})</span>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
