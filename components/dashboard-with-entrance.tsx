"use client"

import { useState, useEffect } from "react"
import { GPUDashboard } from "./gpu-dashboard"
import { PageEntrance } from "./page-entrance"
import { fetchGPUData } from "@/lib/data-utils"

export function DashboardWithEntrance() {
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    // 在后台预加载数据
    const preloadData = async () => {
      try {
        await fetchGPUData()
        setIsDataLoaded(true)
      } catch (error) {
        console.error("Error preloading data:", error)
        // 即使失败也显示内容，让组件内部处理错误
        setIsDataLoaded(true)
      }
    }

    preloadData()
  }, [])

  return (
    <PageEntrance isDataLoaded={isDataLoaded}>
      <GPUDashboard />
    </PageEntrance>
  )
}
