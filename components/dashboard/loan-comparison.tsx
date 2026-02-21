"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, CheckCircle2, Clock, Building2, Percent, Sparkles, ArrowRight, Crown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/i18n"
import Link from "next/link"

export default function LoanComparison() {
  const [loans, setLoans] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("rate")
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null)
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const { user, updateUser } = useUser()
  const { language } = useLanguage()

  useEffect(() => {
    if (user) {
      const offers = generateLoanOffers(user)
      setLoans(offers)
    }
  }, [user])

  const filteredLoans = loans
    .filter((loan) => filter === "all" || loan.category === filter)
    .sort((a, b) => {
      if (sortBy === "rate") return a.rate - b.rate
      if (sortBy === "emi") return a.emi - b.emi
      if (sortBy === "approval") return b.approvalOdds - a.approvalOdds
      return 0
    })

  return (
    <div className="max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{getTranslation(language, "loanComparisonTitle")}</h1>
        <p className="text-lg text-gray-600">{getTranslation(language, "loanComparisonSubtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {["all", "recommended", "premium", "budget"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${filter === f
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {getTranslation(language, (f === "all" ? "allOffers" : f) as any)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="ml-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="rate">{getTranslation(language, "lowestInterestRate")}</option>
          <option value="emi">{getTranslation(language, "lowestEMI")}</option>
          <option value="approval">{getTranslation(language, "highestApproval")}</option>
        </select>
      </div>

      <div className="space-y-5 mb-8">
        {filteredLoans.map((loan, index) => (
          <Card
            key={index}
            className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${loan.isRecommended ? "ring-2 ring-blue-500 shadow-lg" : "border border-gray-200"
              }`}
          >
            {loan.isRecommended && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 blur-xl"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wide">
                    <Crown className="w-4 h-4 fill-white" />
                    AI RECOMMENDED CHOICE
                  </div>
                  <span className="text-white/90 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Highest Approval Odds
                  </span>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Bank Info */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{loan.bankName}</h3>
                      <p className="text-sm text-gray-600">{loan.productName}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {getTranslation(language, "approvalOdds")}
                      </span>
                      <span className="text-sm font-bold text-blue-600">{loan.approvalOdds}%</span>
                    </div>
                    <Progress value={loan.approvalOdds} className="h-2 bg-gray-100" />
                  </div>
                </div>

                {/* Loan Details */}
                <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Percent className="w-4 h-4" />
                      <span className="text-xs font-medium">{getTranslation(language, "interestRate")}</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{loan.rate}%</div>
                    <span className="text-xs text-gray-500">p.a.</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">{getTranslation(language, "monthlyEMI")}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₹{loan.emi.toLocaleString("en-IN")}</div>
                    <span className="text-xs text-gray-500">
                      {loan.tenure}yr {getTranslation(language, "tenure")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{getTranslation(language, "processing")}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{loan.processingTime}</div>
                    <span className="text-xs text-gray-500">{getTranslation(language, "days")}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{getTranslation(language, "totalCost")}</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">₹{loan.totalCost.toLocaleString("en-IN")}</div>
                    <span className="text-xs text-gray-500">{getTranslation(language, "withInterest")}</span>
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      updateUser({
                        selectedLoan: loan,
                        timelineSimulation: {
                          ...user.timelineSimulation,
                          appSubmitStatus: 'completed',
                          appSubmittedAt: Date.now(),
                          approvalStatus: 'pending',
                          approvedAt: undefined
                        }
                      })
                      // HDFC → dedicated bank portal; others → timeline
                      if (loan.bankName === "HDFC Bank") {
                        window.location.href = "/dashboard/apply/hdfc"
                      } else {
                        window.location.href = "/dashboard/timeline"
                      }
                    }}
                    className={`w-full text-white shadow-lg h-11 ${loan.bankName === "HDFC Bank"
                        ? "bg-[#d41e29] hover:bg-[#b01520] shadow-red-200"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                      }`}
                  >
                    {loan.bankName === "HDFC Bank" ? "🏦 Apply at HDFC" : getTranslation(language, "applyNow")}
                  </Button>

                  <Button
                    onClick={() => setExpandedLoan(expandedLoan === index ? null : index)}
                    variant="outline"
                    className="w-full bg-white border-gray-300 hover:bg-gray-50 h-11"
                  >
                    {getTranslation(language, "viewDetails")}
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-gray-600 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{getTranslation(language, "noCreditImpact")}</span>
                  </div>
                </div>
              </div>

              {expandedLoan === index && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {loan.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Loan Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Principal Amount</span>
                          <span className="font-semibold">₹{loan.principal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Interest</span>
                          <span className="font-semibold">₹{loan.totalInterest.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processing Fee ({loan.processingFeePercent}%)</span>
                          <span className="font-semibold">₹{loan.processingFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-900 font-semibold">Total Repayment</span>
                          <span className="font-bold text-blue-600">₹{loan.totalCost.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loan.features && !expandedLoan && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {loan.features.slice(0, 3).map((feature: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-0">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-0 shadow-lg">
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{getTranslation(language, "needHelp")}</h3>
              <p className="text-gray-700 mb-5 text-lg leading-relaxed">{getTranslation(language, "aiHelperText")}</p>
              <Link href="/dashboard/chat">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-11 px-6">
                  {getTranslation(language, "talkToAssistant")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function generateLoanOffers(userData: any) {
  const amount = Number(userData.loanAmount) || 500000
  const tenure = Number(userData.tenure) || 3
  const creditScore = Number(userData.creditScore) || 650
  const hasCreditHistory = userData.hasCreditHistory ?? true
  const employmentType = userData.employmentType || "salaried"

  // Base rates adjusted by credit score
  let rateAdjustment = 0
  if (!hasCreditHistory) rateAdjustment = 2.0
  else if (creditScore >= 800) rateAdjustment = -1.5
  else if (creditScore >= 750) rateAdjustment = -0.75
  else if (creditScore >= 700) rateAdjustment = 0
  else if (creditScore >= 650) rateAdjustment = 0.5
  else rateAdjustment = 1.5

  if (employmentType === "self_employed") rateAdjustment += 0.5
  if (employmentType === "freelancer") rateAdjustment += 1.0

  // Approval odds based on profile
  let baseApproval = 70
  if (creditScore >= 750) baseApproval = 85
  else if (creditScore >= 700) baseApproval = 78
  else if (creditScore >= 650) baseApproval = 68
  else baseApproval = 55

  if (!hasCreditHistory) baseApproval -= 15

  const offers = [
    {
      bankName: "HDFC Bank",
      productName: "Personal Loan - Premium",
      baseRate: 10.5,
      processingFeePercent: 1.5,
      processingTime: 2,
      approvalBonus: 5,
      category: "recommended",
      isRecommended: true,
      features: [
        "Zero prepayment charges after 12 months",
        "Instant disbursal to account",
        "Flexible tenure 1-7 years",
        "No collateral required",
      ],
    },
    {
      bankName: "ICICI Bank",
      productName: "Express Personal Loan",
      baseRate: 10.75,
      processingFeePercent: 2.0,
      processingTime: 3,
      approvalBonus: 3,
      category: "recommended",
      features: ["Quick 24-hour approval", "100% digital process", "Minimal documentation", "Balance transfer option"],
    },
    {
      bankName: "Axis Bank",
      productName: "Quick Personal Loan",
      baseRate: 11.0,
      processingFeePercent: 1.75,
      processingTime: 3,
      approvalBonus: 2,
      category: "budget",
      features: ["No income proof for existing customers", "Part-prepayment allowed", "Doorstep service available"],
    },
    {
      bankName: "Kotak Mahindra Bank",
      productName: "SuperCash Loan",
      baseRate: 10.25,
      processingFeePercent: 2.5,
      processingTime: 4,
      approvalBonus: -2,
      category: "premium",
      features: ["Lowest interest rates", "Premium customer support", "Relationship benefits", "Top-up loan facility"],
    },
    {
      bankName: "SBI",
      productName: "Xpress Credit",
      baseRate: 11.15,
      processingFeePercent: 1.0,
      processingTime: 5,
      approvalBonus: 4,
      category: "budget",
      features: ["Lowest processing fee", "Trusted public sector bank", "Wide branch network", "Simple documentation"],
    },
    {
      bankName: "Bajaj Finserv",
      productName: "Personal Loan",
      baseRate: 11.5,
      processingFeePercent: 2.0,
      processingTime: 1,
      approvalBonus: 0,
      category: "budget",
      features: ["Same day disbursal", "Flexi loan option", "No foreclosure charges", "EMI holiday option"],
    },
  ]

  return offers
    .map((offer) => {
      const rate = Math.max(8.5, Math.min(18, offer.baseRate + rateAdjustment))
      const approvalOdds = Math.min(95, Math.max(30, baseApproval + offer.approvalBonus))

      const monthlyRate = rate / 12 / 100
      const months = tenure * 12
      const emi = calculateEMI(amount, rate, months)

      const totalCost = emi * months
      const totalInterest = totalCost - amount
      const processingFee = Math.round((amount * offer.processingFeePercent) / 100)

      return {
        ...offer,
        rate: Math.round(rate * 100) / 100,
        tenure,
        emi,
        principal: amount,
        totalInterest,
        totalCost,
        processingFee,
        approvalOdds,
      }
    })
    .sort((a, b) => a.rate - b.rate)
}

function calculateEMI(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const monthlyRate = annualRate / 12 / 100
  if (monthlyRate === 0) return Math.round(principal / months)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  return Math.round(emi)
}
