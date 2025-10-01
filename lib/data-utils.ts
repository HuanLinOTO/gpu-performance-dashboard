import type { GPUPerformanceData, PlatformStats } from "./types"

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/zzc0721/torch-performance-test-data/refs/heads/main/database.md"

const PLATFORM_TAGS = {
  GCP: "GCP",
  colab: "Google Colab",
  实体机: "Physical Machine",
  笔记本: "Laptop",
  openi: "OpenI",
  优云智算: "UCloud",
  智算云扉: "AIGate",
  docker: "Docker",
}

export function extractPlatform(note: string): string {
  for (const [tag, platform] of Object.entries(PLATFORM_TAGS)) {
    if (note.toLowerCase().includes(tag.toLowerCase())) {
      return platform
    }
  }
  return "Unknown"
}

export function parseMarkdownTable(markdown: string): GPUPerformanceData[] {
  const lines = markdown.split("\n")
  const dataLines = lines.filter((line) => line.startsWith("|") && !line.includes("device") && !line.includes("---"))

  return dataLines
    .map((line) => {
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell)

      if (cells.length >= 6) {
        const device = cells[0]
        const fp32 = Number.parseFloat(cells[1]) || 0
        const fp16 = Number.parseFloat(cells[2]) || 0
        const bf16 = Number.parseFloat(cells[3]) || 0
        // FP8 E4M3FN 在第4列(索引3之后),可能不存在或为空
        const fp8Value = cells.length >= 7 ? cells[4].trim() : ""
        const fp8 = fp8Value && fp8Value !== "" && fp8Value !== "-"
          ? Number.parseFloat(fp8Value)
          : undefined
        // 如果有 FP8 列,note 和 contributor 的位置会后移
        const noteIndex = cells.length >= 7 ? 5 : 4
        const contributorIndex = cells.length >= 7 ? 6 : 5
        const note = cells[noteIndex] || ""
        const contributor = cells[contributorIndex] || "" // 保留原始 Markdown 格式
        const platform = extractPlatform(note)

        const result: GPUPerformanceData = {
          device,
          fp32,
          fp16,
          bf16,
          note,
          contributor,
          platform,
        }

        // 只在 FP8 值有效时添加
        if (fp8 !== undefined && !isNaN(fp8) && fp8 > 0) {
          result.fp8 = fp8
        }

        return result
      }
      return null
    })
    .filter(Boolean) as GPUPerformanceData[]
}

// Cache variables
let cachedData: GPUPerformanceData[] | null = null;
let cachedAt: number | null = null;
let fetching_promise: Promise<GPUPerformanceData[]> | null = null;

export async function fetchGPUData(): Promise<GPUPerformanceData[]> {
  console.log("Fetching GPU data...");

  // 1分钟缓存
  const now = Date.now();
  if (cachedData && cachedAt && now - cachedAt < 60 * 1000) {
    return cachedData;
  }

  if (!fetching_promise) {
    fetching_promise = (async () => {
      // 先尝试 GitHub
      try {
        const response = await fetch(GITHUB_RAW_URL, {
          next: { revalidate: 300 }, // Cache for 5 minutes
        });
        if (!response.ok) throw new Error("github fetch failed");
        const markdown = await response.text();
        const data = parseMarkdownTable(markdown);
        cachedData = data;
        cachedAt = now;
        return data;
      } catch (error) {
        console.error("Error fetching GPU data from GitHub, fallback to API:", error);
        // 降级到本地 API
        try {
          const apiResp = await fetch("/api/database");
          if (!apiResp.ok) throw new Error("api fetch failed");
          const apiData = await apiResp.json();
          cachedData = apiData;
          cachedAt = now;
          return apiData;
        } catch (apiError) {
          console.error("Error fetching GPU data from API:", apiError);
          return [];
        }
      }
    })();
  }
  return await fetching_promise;
}

export function calculatePlatformStats(data: GPUPerformanceData[]): PlatformStats[] {
  const platformGroups = data.reduce(
    (acc, item) => {
      const platform = item.platform || "Unknown"
      if (!acc[platform]) {
        acc[platform] = []
      }
      acc[platform].push(item)
      return acc
    },
    {} as Record<string, GPUPerformanceData[]>,
  )

  return Object.entries(platformGroups)
    .map(([platform, devices]) => {
      const count = devices.length
      const avgFp32 = devices.reduce((sum, d) => sum + d.fp32, 0) / count
      const avgFp16 = devices.reduce((sum, d) => sum + d.fp16, 0) / count
      const avgBf16 = devices.reduce((sum, d) => sum + d.bf16, 0) / count

      // 计算 FP8 平均值 - 只统计有 FP8 值的设备
      const fp8Devices = devices.filter(d => d.fp8 !== undefined && !isNaN(d.fp8))
      const avgFp8 = fp8Devices.length > 0
        ? fp8Devices.reduce((sum, d) => sum + (d.fp8 || 0), 0) / fp8Devices.length
        : undefined

      const stats: PlatformStats = {
        platform,
        count,
        avgFp32: Math.round(avgFp32 * 100) / 100,
        avgFp16: Math.round(avgFp16 * 100) / 100,
        avgBf16: Math.round(avgBf16 * 100) / 100,
        devices,
      }

      if (avgFp8 !== undefined) {
        stats.avgFp8 = Math.round(avgFp8 * 100) / 100
      }

      return stats
    })
    .sort((a, b) => b.avgFp16 - a.avgFp16)
}

export function getTopPerformers(
  data: GPUPerformanceData[],
  metric: "fp32" | "fp16" | "bf16" | "fp8" = "fp16",
  limit = 5,
): GPUPerformanceData[] {
  // 对于 FP8,只考虑有该值的设备
  const filteredData = metric === "fp8"
    ? data.filter(d => d.fp8 !== undefined && !isNaN(d.fp8))
    : data

  return [...filteredData]
    .sort((a, b) => {
      const aValue = a[metric] || 0
      const bValue = b[metric] || 0
      return bValue - aValue
    })
    .slice(0, limit)
}
