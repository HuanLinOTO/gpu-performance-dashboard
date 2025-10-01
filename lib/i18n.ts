export type Language = "en" | "zh"

export interface Translations {
  dashboard: {
    title: string
    subtitle: string
    devices: string
    updated: string
    platforms: string
    topPerformers: string
    comingSoon: string
  }
  tabs: {
    table: string
    analytics: string
    comparison: string
  }
  table: {
    device: string
    platform: string
    contributor: string
    note: string
    performanceData: string
    of: string
  }
  stats: {
    totalDevices: string
    benchmarkedGpus: string
    avgFp16Performance: string
    tflopsAverage: string
    topPerformer: string
    mostCommonPlatform: string
    devices: string
  }
  platforms: {
    GCP: string
    "Google Colab": string
    "Physical Machine": string
    Laptop: string
    Docker: string
    UCloud: string
    AIGate: string
    OpenI: string
    Unknown: string
  }
  charts: {
      topFp16: string
      topFp32: string
      topBf16: string
      topFp8: string
      platformComparison: string
      devicePerformance: string
    }
  actions: {
    refresh: string
    search: string
    filter: string
    tryAgain: string
  }
  errors: {
    loadingData: string
    errorLoading: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    dashboard: {
      title: "GPU Performance Dashboard",
      subtitle: "Comprehensive benchmarking data from the community",
      devices: "devices",
      updated: "Updated",
      platforms: "platforms",
      topPerformers: "Top performers & trends",
      comingSoon: "Coming soon",
    },
    tabs: {
      table: "Table",
      analytics: "Analytics",
      comparison: "Comparison",
    },
    table: {
      device: "Device",
      platform: "Platform",
      contributor: "Contributor",
      note: "Note",
      performanceData: "Performance Data",
      of: "of",
    },
    stats: {
      totalDevices: "Total Devices",
      benchmarkedGpus: "Benchmarked GPUs",
      avgFp16Performance: "Avg FP16 Performance",
      tflopsAverage: "TFLOPS average",
      topPerformer: "Top Performer",
      mostCommonPlatform: "Most Common Platform",
      devices: "devices",
    },
    platforms: {
      GCP: "GCP",
      "Google Colab": "Google Colab",
      "Physical Machine": "Physical Machine",
      Laptop: "Laptop",
      Docker: "Docker",
      UCloud: "UCloud",
      AIGate: "AIGate",
      OpenI: "OpenI",
      Unknown: "Unknown",
    },
    charts: {
      topFp16: "Top FP16 Performers",
      topFp32: "Top FP32 Performers",
      topBf16: "Top BF16 Performers",
      topFp8: "Top FP8 E4M3FN Performers",
      platformComparison: "Platform Comparison",
      devicePerformance: "Device Performance Analysis",
    },
    actions: {
      refresh: "Refresh",
      search: "Search devices...",
      filter: "Filter",
      tryAgain: "Try Again",
    },
    errors: {
      loadingData: "Loading GPU performance data...",
      errorLoading: "Error Loading Data",
    },
  },
  zh: {
    dashboard: {
      title: "GPU 性能仪表板",
      subtitle: "来自社区的综合基准测试数据",
      devices: "设备",
      updated: "更新于",
      platforms: "平台",
      topPerformers: "顶级性能和趋势",
      comingSoon: "即将推出",
    },
    tabs: {
      table: "表格",
      analytics: "分析",
      comparison: "对比",
    },
    table: {
      device: "设备",
      platform: "平台",
      contributor: "贡献者",
      note: "备注",
      performanceData: "性能数据",
      of: "共",
    },
    stats: {
      totalDevices: "设备总数",
      benchmarkedGpus: "基准测试 GPU",
      avgFp16Performance: "FP16 平均性能",
      tflopsAverage: "TFLOPS 平均值",
      topPerformer: "最佳性能",
      mostCommonPlatform: "最常见平台",
      devices: "设备",
    },
    platforms: {
      GCP: "GCP",
      "Google Colab": "Google Colab",
      "Physical Machine": "实体机",
      Laptop: "笔记本",
      Docker: "Docker",
      UCloud: "优云智算",
      AIGate: "智算云扉",
      OpenI: "OpenI",
      Unknown: "未知",
    },
    charts: {
      topFp16: "FP16 性能排行",
      topFp32: "FP32 性能排行",
      topBf16: "BF16 性能排行",
      topFp8: "FP8 E4M3FN 性能排行",
      platformComparison: "平台对比",
      devicePerformance: "设备性能分析",
    },
    actions: {
      refresh: "刷新",
      search: "搜索设备...",
      filter: "筛选",
      tryAgain: "重试",
    },
    errors: {
      loadingData: "正在加载 GPU 性能数据...",
      errorLoading: "数据加载错误",
    },
  },
}

export function useTranslation(language: Language) {
  return translations[language]
}
