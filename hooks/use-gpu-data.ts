"use client"

import { useState, useEffect, useMemo } from "react"
import type { GPUPerformanceData, PlatformStats, FilterOptions, SortField, SortDirection } from "@/lib/types"
import { fetchGPUData, calculatePlatformStats } from "@/lib/data-utils"

export function useGPUData() {
  const [data, setData] = useState<GPUPerformanceData[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const gpuData = await fetchGPUData()
      setData(gpuData)
      setPlatformStats(calculatePlatformStats(gpuData))
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    platformStats,
    loading,
    error,
    lastUpdated,
    refetch: loadData,
  }
}

export function useFilteredData(
  data: GPUPerformanceData[],
  filters: FilterOptions,
  sortField: SortField,
  sortDirection: SortDirection,
) {
  return useMemo(() => {
    let filtered = [...data]

    // Apply platform filter
    if (filters.platforms.length > 0) {
      filtered = filtered.filter((item) => filters.platforms.includes(item.platform || "Unknown"))
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.device.toLowerCase().includes(query) ||
          item.note.toLowerCase().includes(query) ||
          item.contributor.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "device":
          aValue = a.device
          bValue = b.device
          break
        case "platform":
          aValue = a.platform || "Unknown"
          bValue = b.platform || "Unknown"
          break
        default:
          aValue = a[sortField]
          bValue = b[sortField]
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [data, filters, sortField, sortDirection])
}
