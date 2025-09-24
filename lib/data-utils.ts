import type { GPUPerformanceData, PlatformStats } from "./types"

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/zzc0721/torch-performance-test-data/refs/heads/main/database.md"

const PLATFORM_TAGS = {
  GCP: "GCP",
  实体机: "Physical Machine",
  笔记本: "Laptop",
  优云智算: "UCloud",
  智算云扉: "AIGate",
  docker: "Docker",
}

export function extractPlatform(note: string): string {
  for (const [tag, platform] of Object.entries(PLATFORM_TAGS)) {
    if (note.includes(tag)) {
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
        const note = cells[4]
        const contributor = cells[5].replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
        const platform = extractPlatform(note)

        return {
          device,
          fp32,
          fp16,
          bf16,
          note,
          contributor,
          platform,
        }
      }
      return null
    })
    .filter(Boolean) as GPUPerformanceData[]
}

// Cache variables
let cachedData: GPUPerformanceData[] | null = null;
let cachedAt: number | null = null;

export async function fetchGPUData(): Promise<GPUPerformanceData[]> {
  // 1分钟缓存
  const now = Date.now();
  if (cachedData && cachedAt && now - cachedAt < 60 * 1000) {
    return cachedData;
  }
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

      return {
        platform,
        count,
        avgFp32: Math.round(avgFp32 * 100) / 100,
        avgFp16: Math.round(avgFp16 * 100) / 100,
        avgBf16: Math.round(avgBf16 * 100) / 100,
        devices,
      }
    })
    .sort((a, b) => b.avgFp16 - a.avgFp16)
}

export function getTopPerformers(
  data: GPUPerformanceData[],
  metric: "fp32" | "fp16" | "bf16" = "fp16",
  limit = 5,
): GPUPerformanceData[] {
  return [...data].sort((a, b) => b[metric] - a[metric]).slice(0, limit)
}
