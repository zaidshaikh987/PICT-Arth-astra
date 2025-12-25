"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ShieldAlert,
  Search,
  Briefcase,
  ScrollText,
  CheckCircle2,
  ArrowRight,
  Bot,
  BrainCircuit,
  Gavel,
  Loader2
} from "lucide-react"

// Types matching the API response
type Investigation = { rootCause: string; severity: string; hiddenFactor: string }
type Strategy = { strategyName: string; actionItem: string; negotiationScript: string }
type Plan = { step1: string; step2: string; step3: string; estimatedDays: number }

type AgentState = "idle" | "working" | "completed"

export default function RejectionRecovery() {
  const [status, setStatus] = useState<"initial" | "analyzing" | "complete">("initial")

  // Agent States
  const [investigatorState, setInvestigatorState] = useState<AgentState>("idle")
  const [negotiatorState, setNegotiatorState] = useState<AgentState>("idle")
  const [architectState, setArchitectState] = useState<AgentState>("idle")

  // Data
  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)

  const startRecoveryMission = async () => {
    setStatus("analyzing")
    setInvestigatorState("working")

    // Fetch user data
    const savedData = localStorage.getItem("onboardingData")
    const userData = savedData ? JSON.parse(savedData) : {}

    try {
      const res = await fetch("/api/rejection-recovery", {
        method: "POST",
        body: JSON.stringify(userData)
      })
      const data = await res.json()

      // Simulate sequential agent handoffs for effect

      // 1. Investigator finishes
      setTimeout(() => {
        setInvestigation(data.stage1_investigation)
        setInvestigatorState("completed")
        setNegotiatorState("working")
      }, 2000)

      // 2. Negotiator finishes
      setTimeout(() => {
        setStrategy(data.stage2_strategy)
        setNegotiatorState("completed")
        setArchitectState("working")
      }, 5000)

      // 3. Architect finishes
      setTimeout(() => {
        setPlan(data.stage3_plan)
        setArchitectState("completed")
        setStatus("complete")
      }, 8000)

    } catch (e) {
      console.error("Squad failed", e)
      setStatus("initial")
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-600" />
          Financial Recovery Squad (Multi-Agent System)
        </h1>
        <p className="text-gray-600 mt-2">
          Deploy an autonomous team of AI agents to investigate, negotiate, and plan your financial comeback.
        </p>
      </div>

      {status === "initial" && (
        <Card className="p-12 text-center bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <Bot className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activate the Squad</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Three specialized autonomous agents are standing by to analyze your case.
            They will communicate with each other to build a personalized recovery strategy.
          </p>
          <Button size="lg" onClick={startRecoveryMission} className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8">
            Deploy Agents Now
          </Button>
        </Card>
      )}

      {status !== "initial" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Agent 1: The Investigator */}
          <AgentCard
            name="The Investigator"
            role="Data Forensics"
            icon={Search}
            state={investigatorState}
            color="blue"
          >
            {investigation && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase">Root Cause Identified</p>
                  <p className="text-sm font-semibold text-blue-900 mt-1">{investigation.rootCause}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hidden Factor</p>
                  <p className="text-sm text-gray-700">{investigation.hiddenFactor}</p>
                </div>
              </div>
            )}
          </AgentCard>

          {/* Agent 2: The Negotiator */}
          <AgentCard
            name="The Negotiator"
            role="Strategy & Disputes"
            icon={Gavel}
            state={negotiatorState}
            color="orange"
          >
            {strategy && (
              <div className="space-y-3">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <p className="text-xs font-bold text-orange-800 uppercase">Recommended Strategy</p>
                  <p className="text-sm font-semibold text-orange-900 mt-1">{strategy.strategyName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Script Generated</p>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded text-gray-600 mt-1">
                    "{strategy.negotiationScript.substring(0, 100)}..."
                  </p>
                </div>
              </div>
            )}
          </AgentCard>

          {/* Agent 3: The Architect */}
          <AgentCard
            name="The Architect"
            role="Wealth Planning"
            icon={Briefcase}
            state={architectState}
            color="emerald"
          >
            {plan && (
              <div className="space-y-3">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 uppercase">Master Plan Ready</p>
                  <p className="text-sm font-semibold text-emerald-900 mt-1">{plan.estimatedDays} Days to Goal</p>
                </div>
                <div className="space-y-2">
                  <Step num={1} text={plan.step1} />
                  <Step num={2} text={plan.step2} />
                  <Step num={3} text={plan.step3} />
                </div>
              </div>
            )}
          </AgentCard>
        </div>
      )}

      {/* Handoff Visualizer (Arrows) */}
      {status === "analyzing" && (
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500 animate-pulse">
          <span>Processing Pipeline...</span>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

    </div>
  )
}

function AgentCard({ name, role, icon: Icon, state, children, color }: any) {
  const isWorking = state === "working"
  const isCompleted = state === "completed"

  const colorClasses = {
    blue: "border-blue-200 bg-blue-50/50",
    orange: "border-orange-200 bg-orange-50/50",
    emerald: "border-emerald-200 bg-emerald-50/50"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-5 relative overflow-hidden bg-white shadow-sm ${isWorking ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isCompleted ? `bg-${color}-100` : 'bg-gray-100'}`}>
          <Icon className={`w-6 h-6 ${isCompleted ? `text-${color}-600` : 'text-gray-500'}`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
        {isWorking && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin ml-auto" />}
        {isCompleted && <CheckCircle2 className={`w-5 h-5 text-${color}-600 ml-auto`} />}
      </div>

      <div className="min-h-[150px]">
        {state === "idle" && <p className="text-sm text-gray-400 italic">Waiting for handoff...</p>}
        {state === "working" && <p className="text-sm text-indigo-600 animate-pulse">Analyzing Agent Output...</p>}
        {state === "completed" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.div>}
      </div>
    </motion.div>
  )
}

function Step({ num, text }: { num: number, text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
        {num}
      </span>
      <span className="text-gray-700">{text}</span>
    </div>
  )
}
