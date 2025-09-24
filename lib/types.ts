export interface GPUPerformanceData {
  device: string
  fp32: number
  fp16: number
  bf16: number
  note: string
  contributor: string
  platform?: string
}

export interface PlatformStats {
  platform: string
  count: number
  avgFp32: number
  avgFp16: number
  avgBf16: number
  devices: GPUPerformanceData[]
}

export type SortField = "device" | "fp32" | "fp16" | "bf16" | "platform"
export type SortDirection = "asc" | "desc"

export interface FilterOptions {
  platforms: string[]
  searchQuery: string
}

export type Language = "en" | "zh"
