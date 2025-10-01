import { DashboardWithEntrance } from "@/components/dashboard-with-entrance"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GPU Benchmark Comparison Tool - FP32, FP16, BF16, FP8 Performance Data",
  description: "Compare GPU performance across NVIDIA RTX, AMD, and other GPUs. Real-world FP32, FP16, BF16, and FP8 E4M3FN benchmark data from Google Colab, GCP, Docker, and more platforms.",
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">GPU Performance Dashboard - Compare GPU Benchmarks</h1>
      <h2 className="sr-only">Real-World GPU Performance Data for AI and Machine Learning</h2>
      <DashboardWithEntrance />
    </main>
  )
}
