import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ApplicationTimeline from "@/components/dashboard/application-timeline"

export const metadata = {
  title: "Application Timeline - ArthAstra",
  description: "Track your loan application progress",
}

export default function TimelinePage() {
  return (
    <DashboardLayout>
      <ApplicationTimeline />
    </DashboardLayout>
  )
}
