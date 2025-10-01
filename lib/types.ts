export interface GPUPerformanceData {
  device: string
  fp32: number
  fp16: number
  bf16: number
  fp8?: number // FP8 E4M3FN - 可选,因为旧数据可能没有这个值
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
  avgFp8?: number // 可选
  devices: GPUPerformanceData[]
}

export type SortField = "device" | "fp32" | "fp16" | "bf16" | "fp8" | "platform"
export type SortDirection = "asc" | "desc"

export interface FilterOptions {
  platforms: string[]
  searchQuery: string
}

export type Language = "en" | "zh"
