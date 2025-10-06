export type Language = "en" | "zh"

export interface Translations {
  leaderboard: {
    title: string
    subtitle: string
    description: {
      title: string
      features: string[]
    }
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
    empty: string
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
    Kaggle: string
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
  footer: {
    friendLinks: {
      title: string
      subtitle: string
      links: {
        torchPerformanceTest: string
        svcFusion: string
        ucloud: string
        aigate: string
      }
    }
    copyright: string
    viewOnGithub: string
    icpLicense: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    leaderboard: {
      title: "GPU Performance Leaderboard",
      subtitle: "",
      description: {
        title: "About This Leaderboard",
        features: [
          "View FP32, FP16, and BF16 performance metrics for various compute cards",
          "All data is manually benchmarked using real scripts (except Huawei cards), not paper specifications. Anyone can upload their benchmark results"
        ]
      },
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
      empty: "Empty",
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
      Kaggle: "Kaggle",
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
    footer: {
      friendLinks: {
        title: "Friend Links",
        subtitle: "Thanks to the following projects and organizations",
        links: {
          torchPerformanceTest: "Data Source",
          svcFusion: "Powerful AI Cover Package",
          ucloud: "Get ¥10 free trial, 5% off after verification!",
          aigate: "Register to get 20 credits + 16h 4090D trial"
        }
      },
      copyright: "© 2025 多玩幻灵 qwq",
      viewOnGithub: "View on GitHub",
      icpLicense: "苏ICP备2024094491号-3"
    },
  },
  zh: {
    leaderboard: {
      title: "GPU 性能仪表板",
      subtitle: "",
      description: {
        title: "关于本站",
        features: [
          "支持查看不同计算卡的 FP32、FP16、BF16 性能",
          "每一条数据都由人工同 benchmark 脚本跑出来的，不直接搬运纸面数据，并且支持所有人上传自己跑出来的数据",
          "标注测试平台名称，可以对比不同平台显卡性能的差距"
        ]
      },
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
      empty: "暂无数据",
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
      Kaggle: "Kaggle",
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
    footer: {
      friendLinks: {
        title: "友情链接",
        subtitle: "感谢以下项目和组织的支持",
        links: {
          torchPerformanceTest: "数据来源",
          svcFusion: "超强 AI 翻唱整合包",
          ucloud: "免费领取 10 元体验，认证后 95 折！",
          aigate: "注册领取 20 算力加 16h 4090D体验"
        }
      },
      copyright: "© 2025 多玩幻灵 qwq",
      viewOnGithub: "在 GitHub 上查看",
      icpLicense: "苏ICP备2024094491号-3"
    },
  },
}

export function useTranslation(language: Language) {
  return translations[language]
}
