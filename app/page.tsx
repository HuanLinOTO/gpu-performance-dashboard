import { LeaderboardWithEntrance } from "@/components/leaderboard-with-entrance"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GPU Benchmark Comparison Tool - FP32, FP16, BF16 Performance Data",
  description: "Compare GPU performance across NVIDIA RTX, AMD, and other GPUs. Real-world FP32, FP16, and BF16 benchmark data from Google Colab, GCP, Docker, and more platforms.",
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">GPU Performance Leaderboard - Compare GPU Benchmarks</h1>
      <h2 className="sr-only">Real-World GPU Performance Data for AI and Machine Learning</h2>
      <LeaderboardWithEntrance />
    </main>
  )
}
