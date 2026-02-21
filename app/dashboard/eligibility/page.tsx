import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EligibilityReport from "@/components/dashboard/eligibility-report"

export const metadata = {
  title: "Eligibility Report - ArthAstra",
  description: "Your detailed loan eligibility report",
}

export default function EligibilityPage() {
  return (
    <DashboardLayout>
      <EligibilityReport />
    </DashboardLayout>
  )
}
