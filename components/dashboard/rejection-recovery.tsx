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
  Shield,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react"

// ─── Types ────────────────────────────────────────
type Investigation = {
  rootCause: string
  severity: "High" | "Medium" | "Low" | "Critical"
  bulletPoints: string[]
  hiddenFactor: string
  dtiRatio?: string
  dtiStatus?: string
  riskScore?: number
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
  savingsTarget?: string
}
type AgentState = "idle" | "working" | "completed" | "error"
type PipelineStatus = "initial" | "stage1" | "stage2" | "stage3" | "complete" | "error"

// ─── Main Component ──────────────────────────────
export default function RejectionRecovery() {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("initial")
  const [investigatorState, setInvestigatorState] = useState<AgentState>("idle")
  const [negotiatorState, setNegotiatorState] = useState<AgentState>("idle")
  const [architectState, setArchitectState] = useState<AgentState>("idle")

  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [aiMode, setAiMode] = useState<"gemini-adk" | "local">("gemini-adk")

  const { user } = useUser()

  // ─── Launch Mission ────────────────────────────
  const startRecoveryMission = async () => {
    if (!user) return
    setErrorMsg(null)
    setPipelineStatus("stage1")
    setInvestigatorState("working")
    setNegotiatorState("idle")
    setArchitectState("idle")
    setInvestigation(null)
    setStrategy(null)
    setPlan(null)

    try {
      const userData = {
        monthlyIncome: user.monthlyIncome,
        existingEMI: user.existingEMI,
        monthlyExpenses: user.monthlyExpenses,
        creditScore: user.creditScore,
        employmentType: user.employmentType,
        employmentTenure: user.employmentTenure,
        loanAmount: user.loanAmount,
        savings: user.savings,
      }

      // Call ADK API — no timeout so real Gemini results come through
      const res = await fetch("/api/rejection-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `API error: ${res.status}`)
      }

      const data = await res.json()

      // Determine which mode actually ran
      if (data._metadata?.mode === "adk-multi-agent") {
        setAiMode("gemini-adk")
      } else {
        setAiMode("local")
      }

      // ── Map ADK Gemini JSON to UI schema ──────────────
      const s1 = data.stage1?.result || {}
      const s2 = data.stage2?.result || {}
      const s3 = data.stage3?.result || {}

      // Stage 1 — Investigator (ADK returns rootCause, severity, bulletPoints, hiddenFactor)
      setPipelineStatus("stage2")
      setInvestigatorState("completed")
      setNegotiatorState("working")
      setInvestigation({
        rootCause: s1.rootCause || s1.rootCauses?.[0] || "Analysis completed by Gemini AI",
        severity: (s1.severity as any) || (s1.dtiStatus === "High Risk" ? "High" : "Medium"),
        bulletPoints: s1.bulletPoints || s1.rootCauses || [],
        hiddenFactor: s1.hiddenFactor || s1.anomalies?.anomalies?.[0] || "None detected",
        dtiRatio: s1.dtiRatio || undefined,
        dtiStatus: s1.dtiStatus || undefined,
        riskScore: typeof s1.riskScore === "number" ? s1.riskScore : s1.employmentRisk?.riskScore,
      })

      await delay(600)

      // Stage 2 — Negotiator (ADK returns strategyName, actionItem, bulletPoints, negotiationScript)
      setPipelineStatus("stage3")
      setNegotiatorState("completed")
      setArchitectState("working")

      const rawActions = s2.bulletPoints || s2.actionItems || s2.recommendedActions || []
      const actionItems = Array.isArray(rawActions)
        ? rawActions.map((a: string) => a.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
        : []

      // s2.actionItem is sometimes a single string from ADK — add it as first item
      if (s2.actionItem && !actionItems.includes(s2.actionItem)) {
        actionItems.unshift(s2.actionItem)
      }

      const projectedScore = s2.projectedScore || s2.creditImpact?.projectedScore || (user.creditScore || 650) + 80
      setStrategy({
        strategyName: s2.strategyName || s2.strategy || "Gemini Recovery Strategy",
        actionItems,
        negotiationScript: s2.negotiationScript || "",
        projectedScore,
        scoreImprovement: projectedScore - (user.creditScore || 650),
      })

      await delay(600)

      // Stage 3 — Architect (ADK returns step1, step2, step3, estimatedDays)
      const steps: string[] = []
      if (s3.step1) steps.push(s3.step1)
      if (s3.step2) steps.push(s3.step2)
      if (s3.step3) steps.push(s3.step3)

      // Fallback to actionPlan array if step1/2/3 not present
      if (steps.length === 0 && Array.isArray(s3.actionPlan)) {
        s3.actionPlan.forEach((p: any) => {
          steps.push(typeof p === "string" ? p : p.action || JSON.stringify(p))
        })
      }

      const estimatedDays = s3.estimatedDays || 180
      const estimatedMonths = Math.max(1, Math.round(estimatedDays / 30))

      const readinessDate = new Date()
      readinessDate.setMonth(readinessDate.getMonth() + estimatedMonths)

      setPlan({
        steps: steps.length > 0 ? steps : ["Begin credit profile improvement", "Reduce existing obligations", "Re-apply with improved profile"],
        estimatedMonths,
        readinessDate: readinessDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        savingsTarget: s3.savingsTimeline?.milestones?.[0]?.amount
          ? `₹${Number(s3.savingsTimeline.milestones[0].amount).toLocaleString("en-IN")}`
          : undefined,
      })

      setArchitectState("completed")
      setPipelineStatus("complete")
    } catch (err: any) {
      console.error("Recovery pipeline error:", err)
      setErrorMsg(err.message || "Gemini ADK pipeline failed. Check API key configuration.")

      // Reset states on error
      setInvestigatorState((s) => (s === "working" ? "error" : s))
      setNegotiatorState((s) => (s === "working" ? "error" : s))
      setArchitectState((s) => (s === "working" ? "error" : s))
      setPipelineStatus("error")
    }
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const reset = () => {
    setPipelineStatus("initial")
    setInvestigatorState("idle")
    setNegotiatorState("idle")
    setArchitectState("idle")
    setInvestigation(null)
    setStrategy(null)
    setPlan(null)
    setErrorMsg(null)
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
            <span className="text-slate-500 text-xs">3 Specialist Agents</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
            Recovery Command Center
          </h1>
          <p className="text-slate-400 max-w-xl">
            Three specialist AI agents — Investigator, Negotiator, and Architect — analyze your profile, build counter-strategies, and design a personalized recovery roadmap.
          </p>
        </div>
        <div className="absolute inset-0 z-0 opacity-5 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">Pipeline Error</p>
            <p className="text-red-600 text-xs mt-0.5">{errorMsg}</p>
            <p className="text-red-500 text-xs mt-1">Ensure <code className="bg-red-100 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY</code> is set in <code className="bg-red-100 px-1 rounded">.env.local</code></p>
          </div>
          <Button size="sm" variant="ghost" onClick={reset} className="text-red-700">Retry</Button>
        </div>
      )}

      {/* Launch Panel */}
      {pipelineStatus === "initial" && (
        <Card className="p-10 text-center border-dashed border-2 border-slate-200 bg-white/60 backdrop-blur">
          <Shield className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialize Recovery Protocol</h2>
          <p className="text-gray-500 mb-2 max-w-md mx-auto text-sm">
            Our AI specialist agents will analyze your financial profile and generate a personalized counter-offer strategy.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> AI-Powered Analysis</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" /> ~60–90 seconds</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-400" /> Multi-Agent</span>
          </div>
          <Button
            size="lg"
            onClick={startRecoveryMission}
            className="bg-slate-900 hover:bg-slate-800 text-white text-base px-10 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <BrainCircuit className="w-5 h-5 mr-2" />
            Deploy AI Agents
          </Button>
        </Card>
      )}

      {/* Live Pipeline Status Banner */}
      {(pipelineStatus === "stage1" || pipelineStatus === "stage2" || pipelineStatus === "stage3") && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">
              {pipelineStatus === "stage1" && "🔍 Investigator Agent — Analyzing root causes..."}
              {pipelineStatus === "stage2" && "⚖️ Negotiator Agent — Building counter-strategy..."}
              {pipelineStatus === "stage3" && "🏗️ Architect Agent — Designing recovery roadmap..."}
            </p>
            <p className="text-xs text-indigo-500 mt-0.5">AI analysis in progress • Please wait (up to 90 seconds)</p>
          </div>
        </div>
      )}

      {/* Agent Cards Grid */}
      {pipelineStatus !== "initial" && (
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
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${investigation.severity === "Critical" || investigation.severity === "High"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                    }`}>
                    {investigation.severity}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                </div>

                {(investigation.dtiRatio || investigation.riskScore != null) && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100 space-y-2 text-xs font-mono">
                    {investigation.dtiRatio && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">DTI Ratio</span>
                        <span className="font-bold text-slate-800">{investigation.dtiRatio}</span>
                      </div>
                    )}
                    {investigation.dtiStatus && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">DTI Status</span>
                        <span className={`font-bold ${investigation.dtiStatus === "High Risk" ? "text-red-600" : "text-slate-800"}`}>{investigation.dtiStatus}</span>
                      </div>
                    )}
                    {investigation.riskScore != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Score</span>
                        <span className="font-bold text-slate-800">{investigation.riskScore}/100</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-bold">Root Cause</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{investigation.rootCause}</p>
                </div>

                {investigation.bulletPoints.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">Key Findings</p>
                    <ul className="space-y-1.5">
                      {investigation.bulletPoints.map((point, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {investigation.hiddenFactor && investigation.hiddenFactor !== "None detected" && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Hidden Risk Factor</p>
                    <p className="text-xs text-amber-800 mt-0.5">{investigation.hiddenFactor}</p>
                  </div>
                )}
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
                  <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold">AI Strategy</p>
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

                {strategy.actionItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">Action Steps</p>
                    <ul className="space-y-1.5">
                      {strategy.actionItems.map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-orange-500 font-bold mt-0.5">{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.negotiationScript && (
                  <div className="relative bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
                    <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">Bank Negotiation Script</p>
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
                      <div className={`absolute -left-4 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold z-10 ${i === plan.steps.length - 1
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}>
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

      {/* Completion Footer */}
      {pipelineStatus === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Recovery Analysis Complete</p>
              <p className="text-emerald-600 text-xs">All 3 agents — Investigator, Negotiator, Architect — have completed their analysis</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={reset} className="border-emerald-300 text-emerald-700">
            Run Again
          </Button>
        </motion.div>
      )}

      {pipelineStatus === "error" && !errorMsg && (
        <div className="flex justify-center">
          <Button onClick={reset} variant="outline">Try Again</Button>
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
  const isError = state === "error"

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
        {isError && <AlertTriangle className="w-4 h-4 text-red-500" />}
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
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-400 font-mono animate-pulse">agent.analyzing()...</span>
            </div>
            <div className="h-2.5 w-3/4 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2.5 w-1/2 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2.5 w-5/6 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-2.5 w-2/3 bg-slate-100 rounded-full animate-pulse" />
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-red-400 italic font-mono">agent_failed — see error above</p>
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
