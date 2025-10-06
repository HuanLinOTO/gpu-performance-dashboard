import type { GPUPerformanceData, PlatformStats } from "./types"

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/zzc0721/torch-performance-test-data/refs/heads/main/database.md"

const PLATFORM_TAGS = {
  GCP: "GCP",
  colab: "Google Colab",
  kaggle: "Kaggle",
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

const HEADER_ALIASES: Record<string, string[]> = {
  device: ["device", "gpu", "gpu名称", "gpu name"],
  fp32: ["fp32"],
  tf32: ["tf32"],
  fp16: ["fp16"],
  bf16: ["bf16"],
  fp8: ["fp8", "fp8e4m3fn", "fp8 e4m3fn"],
  note: ["note", "notes", "环境", "environment", "备注"],
  contributor: ["contributor", "贡献者", "提交者", "author"],
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s|:_-]+/g, "")
}

function findHeaderIndex(headerCells: string[], aliases: string[]): number | undefined {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias)
    const index = headerCells.findIndex((cell) => normalizeHeader(cell) === normalizedAlias)
    if (index !== -1) {
      return index
    }
  }
  return undefined
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseNumericCell(cells: string[], index: number | undefined): number {
  if (index === undefined) {
    return 0
  }
  const raw = cells[index] ?? ""
  if (!raw || raw === "-" || raw === "—") {
    return 0
  }
  const cleaned = raw.replace(/[,\s]/g, "")
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? value : 0
}

function getCellValue(cells: string[], index: number | undefined): string {
  if (index === undefined) {
    return ""
  }
  return cells[index] ?? ""
}

export function parseMarkdownTable(markdown: string): GPUPerformanceData[] {
  const lines = markdown.split("\n")
  let headerCells: string[] | null = null
  const dataRows: string[][] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line.startsWith("|")) {
      continue
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim())
    if (cells.length === 0) {
      continue
    }

    if (isSeparatorRow(cells)) {
      continue
    }

    if (!headerCells) {
      headerCells = cells
      continue
    }

    dataRows.push(cells)
  }

  if (!headerCells || dataRows.length === 0) {
    return []
  }

  const indices = {
    device: findHeaderIndex(headerCells, HEADER_ALIASES.device),
    fp32: findHeaderIndex(headerCells, HEADER_ALIASES.fp32),
    tf32: findHeaderIndex(headerCells, HEADER_ALIASES.tf32),
    fp16: findHeaderIndex(headerCells, HEADER_ALIASES.fp16),
    bf16: findHeaderIndex(headerCells, HEADER_ALIASES.bf16),
    fp8: findHeaderIndex(headerCells, HEADER_ALIASES.fp8),
    note: findHeaderIndex(headerCells, HEADER_ALIASES.note),
    contributor: findHeaderIndex(headerCells, HEADER_ALIASES.contributor),
  }

  return dataRows
    .map((cells) => {
      const device = getCellValue(cells, indices.device)
      if (!device) {
        return null
      }

      const fp32 = parseNumericCell(cells, indices.fp32)
      const tf32 = parseNumericCell(cells, indices.tf32)
      const fp16 = parseNumericCell(cells, indices.fp16)
      const bf16 = parseNumericCell(cells, indices.bf16)

      const fp8Value = parseNumericCell(cells, indices.fp8)
      const fp8 = fp8Value > 0 ? fp8Value : undefined

      const note = getCellValue(cells, indices.note)
      const contributor = getCellValue(cells, indices.contributor)
      const platform = extractPlatform(note)

      const result: GPUPerformanceData = {
        device,
        fp32,
        tf32,
        fp16,
        bf16,
        note,
        contributor,
        platform,
      }

      if (fp8 !== undefined) {
        result.fp8 = fp8
      }

      return result
    })
    .filter((item): item is GPUPerformanceData => item !== null)
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
