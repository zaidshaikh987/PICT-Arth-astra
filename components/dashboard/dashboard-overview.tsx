"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Sparkles,
  Landmark,
  Upload,
  BarChart3,
  GitCompare,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Gauge,
  ShieldCheck,
  Clock
} from "lucide-react"
import Link from "next/link"
import { useVoiceAssistant } from "@/lib/voice-assistant-context"
import { DashboardHero } from "@/components/dashboard/dashboard-hero"
import CouncilVisualizer from "@/components/dashboard/council-visualizer"
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator"
import { calculateDTI, analyzeEmploymentRisk } from "@/lib/tools/agent-tools"

// ─── Animated Counter Hook ──────────────────────
function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasAnimated.current || target <= 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()
          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

// ─── Mini DTI Gauge ─────────────────────────────
function MiniDTIGauge({ dti }: { dti: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const clampedDTI = Math.min(100, Math.max(0, dti))
  const strokeDashoffset = circumference - (clampedDTI / 100) * circumference
  const color = dti > 50 ? "#ef4444" : dti > 40 ? "#f59e0b" : "#10b981"
  const label = dti > 50 ? "High" : dti > 40 ? "Moderate" : "Healthy"

  return (
    <div className="relative flex items-center justify-center w-[60px] h-[60px] flex-shrink-0">
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} className="fill-none stroke-slate-100" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={radius}
          className="fill-none transition-all duration-1000 ease-out"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-800">{dti.toFixed(0)}%</span>
        <span className="text-[7px] text-slate-400 font-medium uppercase">{label}</span>
      </div>
    </div>
  )
}

// ─── Quick Actions Bar ──────────────────────────
function QuickActions() {
  const actions = [
    { label: "Upload Docs", icon: Upload, href: "/dashboard/documents", color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100" },
    { label: "Check Score", icon: BarChart3, href: "/dashboard/eligibility", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100" },
    { label: "Compare Loans", icon: GitCompare, href: "/dashboard/loans", color: "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100" },
    { label: "Talk to AI", icon: MessageSquare, href: "/dashboard/optimizer", color: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link key={action.label} href={action.href}>
          <div className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5 ${action.color}`}>
            <action.icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">{action.label}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────
export default function DashboardOverview() {
  const [userData, setUserData] = useState<any>(null)
  const [dtiValue, setDtiValue] = useState(0)
  const [approvalOdds, setApprovalOdds] = useState(0)
  const [empRisk, setEmpRisk] = useState<any>(null)
  const [factors, setFactors] = useState<any[]>([])
  const { guideDashboard, setIsOpen } = useVoiceAssistant()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      const detailedCalc = calculateDetailedEligibility(user)
      const dashboardData = generateDashboardData(user, detailedCalc)
      setUserData({ ...user, ...dashboardData })
      setDtiValue(detailedCalc.financials.dti)
      setApprovalOdds(detailedCalc.approvalOdds)
      setFactors(detailedCalc.factors)

      // Real-time DTI from agent tools (cross-verify)
      const realDTI = calculateDTI(
        Number(user.monthlyIncome) || 30000,
        Number(user.existingEMI) || 0,
        Number(user.monthlyExpenses) || Math.round((Number(user.monthlyIncome) || 30000) * 0.3)
      )
      setDtiValue(realDTI)

      // Employment risk
      const risk = analyzeEmploymentRisk(
        user.employmentType || "salaried",
        user.employmentTenure || "1-2yr"
      )
      setEmpRisk(risk)
    }
  }, [user])

  const eligibilityCounter = useAnimatedCounter(userData?.maxEligibleAmount || 0)
  const oddsCounter = useAnimatedCounter(approvalOdds, 800)

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600" />
      </div>
    )
  }

  // Document details
  const uploadedFiles = user?.uploadedFiles || []
  const requiredDocs = [
    { name: "PAN Card", key: "pan" },
    { name: "Aadhaar Card", key: "aadhaar" },
    { name: "Income Proof", key: "income" },
    { name: "Bank Statement", key: "bank" },
    { name: "Address Proof", key: "address" },
  ]
  const uploadedCount = uploadedFiles.length
  const docPercent = Math.min(100, Math.round((uploadedCount / requiredDocs.length) * 100))

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. Hero */}
      <DashboardHero userData={userData} />

      {/* 2. Quick Actions */}
      <QuickActions />

      {/* 3. Financial Council */}
      <CouncilVisualizer />

      {/* 4. Core Metrics Row — 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Card 1: Eligibility + DTI Gauge */}
        <Link href="/dashboard/eligibility" className="block group">
          <Card className="p-5 h-full border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Gauge className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${userData.isEligible ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                {userData.isEligible ? "Eligible" : "Review"}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Max Loan Amount</p>
                <div ref={eligibilityCounter.ref} className="text-2xl font-bold text-slate-900">
                  {"\u20B9"}{eligibilityCounter.count.toLocaleString("en-IN")}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  EMI Capacity: {"\u20B9"}{(userData.availableForEMI || 0).toLocaleString("en-IN")}/mo
                </p>
              </div>
              <MiniDTIGauge dti={dtiValue} />
            </div>
          </Card>
        </Link>

        {/* Card 2: Documents — Detailed */}
        <Link href="/dashboard/documents" className="block group">
          <Card className="p-5 h-full border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents</span>
              </div>
              <span className="text-sm font-bold text-slate-700">{uploadedCount}/{requiredDocs.length}</span>
            </div>
            {/* Document checklist mini */}
            <div className="space-y-1.5 mb-3">
              {requiredDocs.slice(0, 3).map((doc, i) => {
                const isUploaded = i < uploadedCount
                return (
                  <div key={doc.key} className="flex items-center gap-2">
                    {isUploaded ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${isUploaded ? "text-slate-700" : "text-slate-400"}`}>{doc.name}</span>
                  </div>
                )
              })}
              {requiredDocs.length > 3 && (
                <p className="text-[10px] text-slate-400 pl-5">+{requiredDocs.length - 3} more</p>
              )}
            </div>
            <Progress value={docPercent} className="h-1 bg-slate-100" />
          </Card>
        </Link>

        {/* Card 3: Approval Odds + Risk (replaces empty credit score) */}
        <Card className="p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Odds</span>
            </div>
            <div ref={oddsCounter.ref} className={`text-lg font-bold ${approvalOdds >= 70 ? "text-emerald-600" : approvalOdds >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {oddsCounter.count}%
            </div>
          </div>

          {/* Factor bars */}
          <div className="space-y-2">
            {factors.slice(0, 3).map((f: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-slate-500">{f.name}</span>
                  <span className={`text-[10px] font-bold ${f.status === "pass" ? "text-emerald-600" : f.status === "warning" ? "text-amber-600" : "text-red-600"}`}>
                    {f.score}/100
                  </span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${f.status === "pass" ? "bg-emerald-500" : f.status === "warning" ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Employment Risk Tag */}
          {empRisk && (
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-md ${empRisk.riskLevel === "Low" ? "bg-emerald-50 text-emerald-700" : empRisk.riskLevel === "Medium" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
              <AlertCircle className="w-3 h-3" />
              Employment Risk: {empRisk.riskLevel}
            </div>
          )}
        </Card>
      </div>

      {/* 5. Loan Recommendations */}
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Landmark className="w-5 h-5 text-slate-500" />
        Recommended Offers
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {userData.recommendations?.slice(0, 2).map((loan: any, index: number) => (
            <Card key={index} className="p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{loan.bankName}</h3>
                  {index === 0 && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-sm border border-blue-100">Best Match</span>}
                </div>
                <p className="text-sm text-slate-500">{loan.productName}</p>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Interest</p>
                  <p className="text-lg font-bold text-slate-900">{loan.rate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">EMI</p>
                  <p className="text-lg font-bold text-slate-900">{"\u20B9"}{loan.emi.toLocaleString("en-IN")}</p>
                </div>
                <Link href="/dashboard/loans">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white shadow-none">
                    View <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* AI Insight */}
        <Card className="p-6 border border-blue-100 bg-blue-50/30 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900">AI Insight</h4>
          </div>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            {approvalOdds >= 70
              ? `Your approval odds are ${approvalOdds}%. Banks are likely to offer you competitive rates. Compare now to lock the best deal.`
              : `Your DTI is ${dtiValue.toFixed(1)}%. Reducing existing obligations by ₹${Math.round((Number(user?.existingEMI) || 0) * 0.3).toLocaleString("en-IN")} could boost approval odds by ~15%.`}
          </p>
          <Link href={userData.actionLink} className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {userData.isEligible ? "Compare Offers" : "Improve Profile"}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}

// ─── Helper ─────────────────────────────────────
function generateDashboardData(user: any, calculations: any) {
  const { maxAmount, approvalOdds, financials, overallStatus } = calculations
  const filesCount = (user.uploadedFiles || []).length
  const documentReadiness = Math.min(100, Math.round((filesCount / 5) * 100))

  const baseRate = financials.interestRate
  const baseOdds = approvalOdds
  const loanAmount = user.loanAmount || 100000
  const tenure = user.tenure || 3

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

  // Credit readiness score = weighted average of all eligibility factor scores
  const factors = calculations.factors || []
  const creditReadinessScore = factors.length > 0
    ? Math.round(factors.reduce((sum: number, f: any) => sum + f.score, 0) / factors.length)
    : 0

  return {
    isEligible: overallStatus === "approved",
    maxEligibleAmount: maxAmount,
    availableForEMI: financials.availableForEMI,
    nextAction: overallStatus === "approved" ? "Compare Loans" : "Improve Profile",
    actionLink: overallStatus === "approved" ? "/dashboard/loans" : "/dashboard/optimizer",
    documentReadiness,
    creditReadinessScore,
    recommendations,
  }
}
