"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  Volume2,
} from "lucide-react"
import Link from "next/link"
import { useVoiceAssistant } from "@/lib/voice-assistant-context"
import { DashboardHero } from "@/components/dashboard/dashboard-hero"
import { FinancialHealthChart } from "@/components/dashboard/financial-chart"

export default function DashboardOverview() {
  const [userData, setUserData] = useState<any>(null)
  const { guideDashboard, setIsOpen } = useVoiceAssistant()

  useEffect(() => {
    // Load onboarding data
    const data = localStorage.getItem("onboardingData")
    if (data) {
      const parsedData = JSON.parse(data)

      // Load uploaded files count
      const filesStr = localStorage.getItem("uploadedFiles") || "[]"
      const filesCount = JSON.parse(filesStr).length

      // Calculate eligibility and scores
      const calculations = calculateEligibility(parsedData, filesCount)
      setUserData({ ...parsedData, ...calculations })
    }
  }, [])

  const handleVoiceGuide = () => {
    setIsOpen(true)
    guideDashboard()
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Hero Section (New) */}
      <DashboardHero userData={userData} />

      {/* 2. Key Metrics Grid (Refined) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Financial Chart (New) - Linked to Eligibility */}
        <Link href="/dashboard/eligibility" className="md:col-span-1 block group">
          <div className="h-full transition-transform group-hover:scale-[1.02]">
            <FinancialHealthChart userData={userData} />
          </div>
        </Link>

        {/* Metrics Cards (Softened) */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Eligibility Status */}
          <Link href="/dashboard/eligibility" className="block group">
            <Card className="p-6 h-full shadow-md border-teal-50 bg-gradient-to-br from-white to-teal-50/50 transition-all group-hover:shadow-lg group-hover:border-teal-200 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${userData.isEligible ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {userData.isEligible ? "ELIGIBLE" : "REVIEW NEEDED"}
                </span>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">Max Eligible Amount</p>
                <div className="text-3xl font-bold text-gray-900 tracking-tight">
                  ₹{(userData.maxEligibleAmount || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </Card>
          </Link>

          {/* Document Readiness */}
          <Link href="/dashboard/documents" className="block group">
            <Card className="p-6 h-full shadow-md border-blue-50 bg-gradient-to-br from-white to-blue-50/50 transition-all group-hover:shadow-lg group-hover:border-blue-200 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600">{userData.documentReadiness}% Ready</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Documentation Status</p>
                <Progress value={userData.documentReadiness} className="h-2 bg-blue-100" />
                <p className="text-xs text-gray-400 mt-2 text-right">{5 - Math.floor(userData.documentReadiness / 20)} docs pending</p>
              </div>
            </Card>
          </Link>

          {/* Recommended Action */}
          <Card className="p-6 shadow-md border-cyan-50 bg-gradient-to-br from-white to-cyan-50/50 sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Sparkles className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">AI Recommendation</h4>
                <p className="text-sm text-gray-600">{userData.nextAction}</p>
              </div>
              <Link href={userData.actionLink}>
                <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-200">
                  Take Action
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Optimizer Card */}
          <Link href="/dashboard/optimizer" className="block group">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 shadow-sm hover:shadow-md transition-all group-hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Optimize Path</h3>
              <p className="text-sm text-gray-600">Simulate scenarios to improve eligibility</p>
            </div>
          </Link>

          {/* Timing Card */}
          <Link href="/dashboard/timeline" className="block group">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 shadow-sm hover:shadow-md transition-all group-hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                <Calendar className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Best Timing</h3>
              <p className="text-sm text-gray-600">Know exactly when to apply for success</p>
            </div>
          </Link>

          {/* Documents Card */}
          <Link href="/dashboard/documents" className="block group">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm hover:shadow-md transition-all group-hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Document Checklist</h3>
              <p className="text-sm text-gray-600">Upload and verify your application docs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Loan Recommendations */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recommended Loans</h2>
              <Link href="/dashboard/loans">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {userData.recommendations?.slice(0, 3).map((loan: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border-2 border-gray-100 rounded-lg hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{loan.bankName}</h3>
                      <p className="text-sm text-gray-600">{loan.productName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-600">{loan.rate}%</div>
                      <div className="text-xs text-gray-600">Interest Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>EMI: ₹{loan.emi.toLocaleString("en-IN")}</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">{loan.approvalOdds}% approval odds</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "Eligibility Checked", time: "Just now", icon: CheckCircle2, color: "text-green-600" },
                { action: "Profile Updated", time: "2 mins ago", icon: Users, color: "text-blue-600" },
                { action: "Document Uploaded", time: "1 hour ago", icon: FileCheck, color: "text-purple-600" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <activity.icon className={`w-5 h-5 ${activity.color} mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper Functions
function calculateEligibility(data: any, filesCount: number = 0) {
  const monthlyIncome = data.monthlyIncome || 30000
  const existingEMI = data.existingEMI || 0
  const loanAmount = data.loanAmount || 100000
  const tenure = data.tenure || 3
  const creditScore = data.creditScore || 650

  // DTI Calculation
  const dti = (existingEMI / monthlyIncome) * 100
  const dtiThreshold = data.isJointApplication ? 55 : data.hasCreditHistory ? 50 : 40

  // Eligibility
  const availableIncome = monthlyIncome - existingEMI
  let maxEligible = availableIncome * 60 * tenure

  if (!data.hasCreditHistory) maxEligible *= 0.7
  if (data.creditScore && data.creditScore >= 750) maxEligible *= 1.15
  if (data.isJointApplication && data.coborrowerIncome) {
    maxEligible += data.coborrowerIncome * 40 * tenure
  }

  const isEligible = dti <= dtiThreshold && monthlyIncome >= 25000

  // Document Readiness (Real)
  // Assuming 5 key documents: ID, Address, Income, Bank, Property/Other
  const documentReadiness = Math.min(100, Math.round((filesCount / 5) * 100))

  // Credit Readiness Score
  const financialLoad = Math.max(0, 30 - dti * 0.6)
  const incomeStability = getIncomeStabilityScore(data.employmentType, data.employmentTenure)
  const creditBehavior = data.hasCreditHistory ? (creditScore >= 750 ? 20 : 15) : 5
  // Contribution of docs to readiness: Max 15 points
  const docScoreContribution = Math.round((documentReadiness / 100) * 15)
  const timingScore = 5

  const creditReadinessScore = Math.round(
    financialLoad + incomeStability + creditBehavior + docScoreContribution + timingScore,
  )

  // Dynamic Recommendations based on Credit Score
  let baseRate = 12.0
  let baseOdds = 60

  if (creditScore >= 750) { baseRate = 10.5; baseOdds = 90 }
  else if (creditScore >= 700) { baseRate = 11.5; baseOdds = 75 }
  else if (creditScore >= 650) { baseRate = 13.5; baseOdds = 50 }
  else { baseRate = 15.0; baseOdds = 30 }

  const recommendations = [
    {
      bankName: "HDFC Bank",
      productName: "Personal Loan",
      rate: baseRate,
      emi: Math.round(loanAmount * (baseRate / 1200) / (1 - Math.pow(1 + baseRate / 1200, -tenure * 12))),
      approvalOdds: baseOdds
    },
    {
      bankName: "ICICI Bank",
      productName: "Express Loan",
      rate: baseRate + 0.5,
      emi: Math.round(loanAmount * ((baseRate + 0.5) / 1200) / (1 - Math.pow(1 + (baseRate + 0.5) / 1200, -tenure * 12))),
      approvalOdds: Math.max(0, baseOdds - 5)
    },
    {
      bankName: "Axis Bank",
      productName: "Quick Loan",
      rate: baseRate + 0.3,
      emi: Math.round(loanAmount * ((baseRate + 0.3) / 1200) / (1 - Math.pow(1 + (baseRate + 0.3) / 1200, -tenure * 12))),
      approvalOdds: Math.max(0, baseOdds - 3)
    },
  ]

  return {
    isEligible,
    maxEligibleAmount: Math.floor(maxEligible),
    creditReadinessScore,
    nextAction: isEligible ? "Compare Loans" : "Improve Profile",
    actionLink: isEligible ? "/dashboard/loans" : "/dashboard/optimizer",
    documentReadiness,
    recommendations,
  }
}

function getIncomeStabilityScore(employmentType: string, tenure: string) {
  if (employmentType === "salaried") {
    if (tenure === "5+yr") return 25
    if (tenure === "2-5yr") return 23
    if (tenure === "1-2yr") return 20
    return 18
  }
  if (employmentType === "self_employed") {
    if (tenure === "5+yr") return 22
    if (tenure === "2-5yr") return 18
    return 15
  }
  return 10
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent - Ready to apply!"
  if (score >= 60) return "Good - Few improvements needed"
  if (score >= 40) return "Fair - Work on key areas"
  return "Needs improvement"
}
