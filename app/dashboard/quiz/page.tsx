"use client"

import DashboardLayout from "@/components/dashboard/dashboard-layout"
import FinancialQuiz from "@/components/dashboard/financial-quiz"

export default function QuizPage() {
    return (
        <DashboardLayout>
            <div className="p-6">
                <FinancialQuiz />
            </div>
        </DashboardLayout>
    )
}
