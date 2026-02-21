"use client"

import { useState } from "react"
import { useUser } from "@/lib/user-context"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Search,
  Briefcase,
  Gavel,
  Loader2,
  BrainCircuit,
  Bot,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Shield
} from "lucide-react"
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator"
import {
  calculateDTI,
  analyzeEmploymentRisk,
  detectFinancialAnomalies,
  simulateCreditScoreImpact,
  calculateSavingsTimeline
} from "@/lib/tools/agent-tools"

// ─── Types ────────────────────────────────────────
type Investigation = {
  rootCause: string
  severity: string
  bulletPoints: string[]
  dtiRatio: string
  dtiStatus: string
  riskScore: number
  hiddenFactor: string
}
type Strategy = {
  strategyName: string
  actionItems: string[]
  negotiationScript: string
  projectedScore: number
  scoreImprovement: number
}
type Plan = {
  steps: string[]
  estimatedMonths: number
  readinessDate: string
  savingsTarget: string
}

type AgentState = "idle" | "working" | "completed"

// ─── Main Component ──────────────────────────────
export default function RejectionRecovery() {
  const [status, setStatus] = useState<"initial" | "analyzing" | "complete">("initial")
  const [investigatorState, setInvestigatorState] = useState<AgentState>("idle")
  const [negotiatorState, setNegotiatorState] = useState<AgentState>("idle")
  const [architectState, setArchitectState] = useState<AgentState>("idle")

  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)

  const { user } = useUser()

  // ─── Launch Mission ────────────────────────────
  const startRecoveryMission = async () => {
    if (!user) return
    setStatus("analyzing")
    setInvestigatorState("working")

    const userData = user

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      )
      const fetchPromise = fetch("/api/rejection-recovery", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      const res = (await Promise.race([fetchPromise, timeoutPromise])) as Response
      if (!res.ok) throw new Error("API Failed")
      const data = await res.json()
      runSimulation(data)
    } catch {
      console.warn("API unavailable, using local intelligence engine.")
      const fallbackData = generateLocalRecoveryPlan(userData)
      runSimulation(fallbackData)
    }
  }

  // ─── Simulation Runner ─────────────────────────
  const runSimulation = (data: any) => {
    const s1 = data.stage1.result
    const s2 = data.stage2.result
    const s3 = data.stage3.result

    setTimeout(() => {
      setInvestigation({
        rootCause: s1.rootCauses?.[0] || "Profile Mismatch",
        severity: s1.dtiStatus === "High Risk" || s1.employmentRisk?.riskLevel === "Critical" ? "Critical" : "Moderate",
        bulletPoints: s1.rootCauses || [],
        dtiRatio: s1.dtiRatio || "N/A",
        dtiStatus: s1.dtiStatus || "Unknown",
        riskScore: s1.employmentRisk?.riskScore ?? 0,
        hiddenFactor: s1.anomalies?.anomalies?.[0] || "None detected",
      })
      setInvestigatorState("completed")
      setNegotiatorState("working")
    }, 800)

    setTimeout(() => {
      const actions = (s2.recommendedActions || []).map((a: string) =>
        a.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
      )
      setStrategy({
        strategyName: s2.strategy || "Optimization",
        actionItems: actions,
        negotiationScript: s2.negotiationScript || "",
        projectedScore: s2.projectedScore || 0,
        scoreImprovement: (s2.creditImpact?.projectedScore || s2.projectedScore || 0) - (user?.creditScore || 650),
      })
      setNegotiatorState("completed")
      setArchitectState("working")
    }, 1800)

    setTimeout(() => {
      const planSteps = (s3.actionPlan || []).map((p: any) => p.action || p)
      setPlan({
        steps: planSteps,
        estimatedMonths: s3.estimatedRecoveryMonths || 3,
        readinessDate: s3.readinessDate || "TBD",
        savingsTarget: s3.savingsTimeline
          ? "Rs " + (s3.savingsTimeline.milestones?.[0]?.amount || 0).toLocaleString("en-IN")
          : "",
      })
      setArchitectState("completed")
      setStatus("complete")
    }, 2800)
  }

  // ─── Local Intelligence Engine ─────────────────
  function generateLocalRecoveryPlan(userData: any) {
    // ── CORE ENGINE: Source of Truth ──
    const eligibility = calculateDetailedEligibility(userData)
    const { maxAmount, approvalOdds, financials } = eligibility
    const { monthlyIncome, existingEMI, monthlyExpenses, dti } = financials
    const creditScore = Number(userData.creditScore) || 650
    const loanAmount = Number(userData.loanAmount) || 500000

    // ── TOOL 1: DTI ──
    const computedDTI = calculateDTI(Number(monthlyIncome), Number(existingEMI), Number(monthlyExpenses))

    // ── TOOL 2: Employment Risk ──
    const employmentRisk = analyzeEmploymentRisk(
      userData.employmentType || "salaried",
      userData.employmentTenure || "1-2yr"
    )

    // ── TOOL 3: Anomaly Detection ──
    const anomalies = detectFinancialAnomalies({
      monthlyIncome,
      existingEMI,
      monthlyExpenses,
      employmentType: userData.employmentType,
      savings: userData.savings,
      creditScore,
    })

    // ── STAGE 1: ROOT CAUSE SYNTHESIS ──
    const rootCauses: string[] = []
    if (computedDTI > 40) rootCauses.push("High DTI Ratio (" + computedDTI + "% > 40%)")
    if (creditScore < 750) rootCauses.push("Credit Score " + creditScore + " is below prime threshold of 750")
    if (loanAmount > maxAmount) rootCauses.push("Requested Rs " + loanAmount.toLocaleString("en-IN") + " exceeds max eligible Rs " + maxAmount.toLocaleString("en-IN"))
    if (employmentRisk.riskLevel === "High" || employmentRisk.riskLevel === "Critical") {
      rootCauses.push(employmentRisk.riskLevel + " Employment Risk: " + employmentRisk.reason)
    }
    if (anomalies.hasAnomaly) rootCauses.push(...anomalies.anomalies)
    if (rootCauses.length === 0) rootCauses.push("General profile optimization needed")

    const severity = approvalOdds < 30 ? "Critical" : approvalOdds < 60 ? "High Risk" : "Moderate"

    // ── STAGE 2: NEGOTIATION STRATEGY ──
    const actions: string[] = []
    if (computedDTI > 40) actions.push("pay_off_debt")
    if (creditScore < 750) actions.push("reduce_utilization")
    if (loanAmount > maxAmount) actions.push("request_lower_amount")
    if (anomalies.hasAnomaly) actions.push("dispute_error")

    // ── TOOL 4: Credit Score Simulation ──
    const creditImpact = simulateCreditScoreImpact(creditScore, actions)

    let strategyName = "Profile Optimization"
    let negotiationScript = ""

    if (approvalOdds < 30) {
      strategyName = "Crisis De-leveraging"
      negotiationScript = "I have restructured my obligations. My projected DTI after clearing 2 accounts will be " + Math.max(35, computedDTI - 20).toFixed(1) + "%. I request reconsideration."
    } else if (approvalOdds < 60) {
      strategyName = "Strategic Restructuring"
      const surplus = (monthlyIncome - existingEMI - monthlyExpenses)
      negotiationScript = "I propose a revised tenure to align EMI with my monthly surplus of Rs " + Math.round(surplus).toLocaleString("en-IN") + ". My projected score is " + creditImpact.projectedScore + "."
    } else {
      strategyName = "Prime Positioning"
      negotiationScript = "With a projected score of " + creditImpact.projectedScore + ", I will qualify for the prime rate tier once my recent payment updates within 30 days."
    }

    // ── STAGE 3: RECOVERY BLUEPRINT ──
    const targetDownPayment = loanAmount * 0.2
    const currentSavingsVal = userData.savings === "1L-5L" ? 200000 : userData.savings === "50k-1L" ? 75000 : 25000
    const monthlySurplus = Math.max(5000, monthlyIncome - existingEMI - monthlyExpenses)

    // ── TOOL 5: Savings Timeline ──
    const timeline = calculateSavingsTimeline(currentSavingsVal, targetDownPayment, monthlySurplus)
    const recoveryMonths = Math.max(1, timeline.months)

    const readinessDate = new Date()
    readinessDate.setMonth(readinessDate.getMonth() + recoveryMonths)
    const readinessStr = readinessDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })

    const planSteps = []
    if (computedDTI > 40) planSteps.push({ action: "Clear highest-interest debt first" })
    if (creditScore < 750) planSteps.push({ action: "Reduce credit utilization below 30%" })
    const gap = Math.max(0, targetDownPayment - currentSavingsVal)
    planSteps.push({ action: "Save Rs " + Math.round(gap / 1000) + "k for down payment" })
    planSteps.push({ action: "Re-apply with improved profile" })

    return {
      stage1: {
        result: {
          rootCauses,
          dtiRatio: computedDTI + "%",
          dtiStatus: computedDTI > 50 ? "High Risk" : computedDTI > 40 ? "Moderate" : "Safe",
          employmentRisk,
          anomalies,
        },
      },
      stage2: {
        result: {
          strategy: strategyName,
          recommendedActions: actions,
          negotiationScript,
          projectedScore: creditImpact.projectedScore,
          creditImpact,
        },
      },
      stage3: {
        result: {
          actionPlan: planSteps,
          estimatedRecoveryMonths: recoveryMonths,
          readinessDate: readinessStr,
          savingsTimeline: timeline,
        },
      },
    }
  }

  // ─── UI ────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full">
              Multi-Agent AI
            </span>
            <span className="text-slate-500 text-xs">v4.2 Active</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
            Recovery Command Center
          </h1>
          <p className="text-slate-400 max-w-xl">
            Three autonomous agents analyze your profile, build counter-strategies, and design a recovery roadmap.
          </p>
        </div>
        <div className="absolute inset-0 z-0 opacity-5 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Launch Panel */}
      {status === "initial" && (
        <Card className="p-10 text-center border-dashed border-2 border-slate-200 bg-white/60 backdrop-blur">
          <Shield className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialize Recovery Protocol</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
            The system will deploy Investigator, Negotiator, and Architect agents to analyze your financial profile and generate a personalized counter-offer.
          </p>
          <Button
            size="lg"
            onClick={startRecoveryMission}
            className="bg-slate-900 hover:bg-slate-800 text-white text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <BrainCircuit className="w-5 h-5 mr-2" />
            Deploy Agents
          </Button>
        </Card>
      )}

      {/* Agent Cards Grid */}
      {status !== "initial" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── INVESTIGATOR ── */}
          <AgentCard
            name="THE INVESTIGATOR"
            role="Forensics & Risk"
            icon={Search}
            state={investigatorState}
            accent="blue"
          >
            {investigation && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${investigation.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    {investigation.severity}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DTI Ratio</span>
                    <span className="font-bold text-slate-800">{investigation.dtiRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DTI Status</span>
                    <span className={`font-bold ${investigation.dtiStatus === "High Risk" ? "text-red-600" : "text-slate-800"}`}>{investigation.dtiStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="font-bold text-slate-800">{investigation.riskScore}/100</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">Root Causes</p>
                  <ul className="space-y-1.5">
                    {investigation.bulletPoints.map((point, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </AgentCard>

          {/* ── NEGOTIATOR ── */}
          <AgentCard
            name="THE NEGOTIATOR"
            role="Strategy & Counter-Offers"
            icon={Gavel}
            state={negotiatorState}
            accent="orange"
          >
            {strategy && (
              <>
                <div className="bg-orange-50 rounded-lg p-3 mb-3 border border-orange-100">
                  <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold">Strategy</p>
                  <p className="text-sm font-bold text-orange-800 mt-0.5">{strategy.strategyName}</p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">
                    Projected Score: {strategy.projectedScore}
                    {strategy.scoreImprovement > 0 && (
                      <span className="ml-1 text-emerald-600">(+{strategy.scoreImprovement})</span>
                    )}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">Actions</p>
                  <ul className="space-y-1.5">
                    {strategy.actionItems.map((item, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-orange-500 font-bold mt-0.5">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {strategy.negotiationScript && (
                  <div className="relative bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
                    <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">Bank Script</p>
                    <p className="text-xs text-indigo-800 italic leading-relaxed">
                      &ldquo;{strategy.negotiationScript}&rdquo;
                    </p>
                  </div>
                )}
              </>
            )}
          </AgentCard>

          {/* ── ARCHITECT ── */}
          <AgentCard
            name="THE ARCHITECT"
            role="Blueprint & Timeline"
            icon={Briefcase}
            state={architectState}
            accent="emerald"
          >
            {plan && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Recovery Time</p>
                    <p className="text-2xl font-bold text-slate-800">{plan.estimatedMonths} Months</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700">{plan.readinessDate}</span>
                  </div>
                </div>

                {/* Timeline Steps */}
                <div className="relative pl-4 space-y-4">
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-emerald-300 to-emerald-100" />

                  {plan.steps.map((step, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className={`absolute -left-4 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold z-10 ${i === plan.steps.length - 1 ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                        {i + 1}
                      </div>
                      <span className="text-xs text-slate-600 ml-2">{step}</span>
                    </div>
                  ))}
                </div>

                {plan.savingsTarget && (
                  <div className="mt-4 text-xs text-slate-400">
                    Savings Target: <span className="font-bold text-slate-600">{plan.savingsTarget}</span>
                  </div>
                )}
              </>
            )}
          </AgentCard>
        </div>
      )}

      {/* Pipeline Status */}
      {status === "analyzing" && (
        <div className="flex justify-center items-center gap-3 text-sm text-slate-400 animate-pulse py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-mono">agents_processing...</span>
        </div>
      )}
    </div>
  )
}

// ─── Agent Card Component ────────────────────────
function AgentCard({ name, role, icon: Icon, state, accent, children }: {
  name: string
  role: string
  icon: any
  state: AgentState
  accent: "blue" | "orange" | "emerald"
  children?: React.ReactNode
}) {
  const isWorking = state === "working"
  const isCompleted = state === "completed"

  const themes = {
    blue: { border: "border-blue-200", headerBg: "bg-blue-50/50", iconBg: "bg-blue-100", iconColor: "text-blue-600", check: "text-blue-600" },
    orange: { border: "border-orange-200", headerBg: "bg-orange-50/50", iconBg: "bg-orange-100", iconColor: "text-orange-600", check: "text-orange-600" },
    emerald: { border: "border-emerald-200", headerBg: "bg-emerald-50/50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", check: "text-emerald-600" },
  }
  const t = themes[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col rounded-xl border-2 ${t.border} bg-white shadow-sm overflow-hidden transition-all ${isWorking ? "ring-2 ring-indigo-400 ring-offset-2" : ""}`}
    >
      {/* Header */}
      <div className={`px-5 py-3.5 ${t.headerBg} border-b ${t.border} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${t.iconBg}`}>
            <Icon className={`w-4 h-4 ${t.iconColor}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{role}</p>
            <p className={`text-sm font-bold ${t.iconColor}`}>{name}</p>
          </div>
        </div>
        {isWorking && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
        {isCompleted && <CheckCircle2 className={`w-5 h-5 ${t.check}`} />}
      </div>

      {/* Body */}
      <div className="flex-1 p-5 min-h-[200px]">
        {state === "idle" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-300 italic font-mono">awaiting_handoff...</p>
          </div>
        )}
        {isWorking && (
          <div className="space-y-3 pt-2">
            <div className="h-2.5 w-3/4 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2.5 w-1/2 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2.5 w-5/6 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2.5 w-2/3 bg-slate-100 rounded-full animate-pulse" />
          </div>
        )}
        {isCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
