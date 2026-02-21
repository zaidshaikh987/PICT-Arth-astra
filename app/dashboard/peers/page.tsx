import DashboardLayout from "@/components/dashboard/dashboard-layout"
import PeerInsights from "@/components/dashboard/peer-insights"

export const metadata = {
  title: "Peer Insights - ArthAstra",
  description: "See how you compare with others",
}

export default function PeersPage() {
  return (
    <DashboardLayout>
      <PeerInsights />
    </DashboardLayout>
  )
}
