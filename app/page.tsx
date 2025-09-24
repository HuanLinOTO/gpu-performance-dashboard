import { GPUDashboard } from "@/components/gpu-dashboard"
import { PageEntrance } from "@/components/page-entrance"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <PageEntrance>
        <GPUDashboard />
      </PageEntrance>
    </main>
  )
}
