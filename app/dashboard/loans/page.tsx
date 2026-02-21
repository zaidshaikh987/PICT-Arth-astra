import DashboardLayout from "@/components/dashboard/dashboard-layout"
import LoanComparison from "@/components/dashboard/loan-comparison"

export const metadata = {
  title: "Loan Comparison - ArthAstra",
  description: "Compare and find the best loan offers",
}

export default function LoansPage() {
  return (
    <DashboardLayout>
      <LoanComparison />
    </DashboardLayout>
  )
}
