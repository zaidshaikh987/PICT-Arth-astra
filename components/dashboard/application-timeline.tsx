"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, Clock, Circle, XCircle,
  FileCheck, TrendingUp, ShieldCheck, Building2,
  ClipboardCheck, Trophy, ArrowRight, RefreshCw,
  AlertCircle, Phone
} from "lucide-react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

type StageStatus = "completed" | "in-progress" | "pending" | "locked"

interface Stage {
  id: string
  title: string
  subtitle: string
  icon: any
  status: StageStatus
  date?: string
  detail?: string
  link?: string
  linkLabel?: string
  twilioStage?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REQUIRED_DOCS = ["pan", "aadhaar", "salary-slip", "bank-statement"]

async function notify(stage: string, user: any) {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, userData: { name: user.name, phone: user.phone, creditScore: user.creditScore, amount: user.loanAmount } })
    })
  } catch (e) {
    console.error("[Notify]", e)
  }
}

function relativeTime(ts: number | undefined) {
  if (!ts) return undefined
  const d = new Date(ts)
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

// ─── Status Icon ─────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: StageStatus }) {
  if (status === "completed") return (
    <div className="w-11 h-11 rounded-full bg-green-100 border-4 border-white shadow flex items-center justify-center">
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    </div>
  )
  if (status === "in-progress") return (
    <div className="w-11 h-11 rounded-full bg-blue-100 border-4 border-white shadow flex items-center justify-center animate-pulse">
      <Clock className="w-5 h-5 text-blue-600" />
    </div>
  )
  if (status === "locked") return (
    <div className="w-11 h-11 rounded-full bg-gray-100 border-4 border-white shadow flex items-center justify-center opacity-50">
      <Circle className="w-5 h-5 text-gray-300" />
    </div>
  )
  return (
    <div className="w-11 h-11 rounded-full bg-amber-100 border-4 border-white shadow flex items-center justify-center">
      <AlertCircle className="w-5 h-5 text-amber-600" />
    </div>
  )
}

// ─── Stage Card ───────────────────────────────────────────────────────────────

function StageCard({ stage, isLast }: { stage: Stage; isLast: boolean }) {
  const isCompleted = stage.status === "completed"
  const isActive = stage.status === "in-progress"
  const isLocked = stage.status === "locked"
  const Icon = stage.icon

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <StatusIcon status={stage.status} />
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 mb-1 ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} style={{ minHeight: 32 }} />
        )}
      </div>

      {/* Card body */}
      <div className={`flex-1 mb-4 rounded-2xl border transition-all ${isActive
        ? "border-blue-300 ring-4 ring-blue-50 shadow-lg"
        : isCompleted
          ? "border-green-100 bg-green-50/30"
          : isLocked
            ? "border-gray-100 opacity-60"
            : "border-amber-100 bg-amber-50/20"
        } bg-white shadow-sm overflow-hidden`}>

        {/* Header */}
        <div className={`px-5 py-3.5 flex items-center gap-3 ${isActive ? "bg-blue-600" : isCompleted ? "bg-green-600" : isLocked ? "bg-gray-400" : "bg-amber-500"}`}>
          <Icon className="w-5 h-5 text-white flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm">{stage.title}</h3>
            <p className="text-white/80 text-xs">{stage.subtitle}</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCompleted ? "bg-white/20 text-white" : isActive ? "bg-white text-blue-700" : "bg-white/20 text-white"}`}>
            {isCompleted ? "Done ✓" : isActive ? "In Progress" : isLocked ? "Locked" : "Upcoming"}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {stage.date && (
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {stage.date}
            </p>
          )}
          {stage.detail && (
            <p className={`text-sm ${isLocked ? "text-gray-400" : "text-gray-600"}`}>{stage.detail}</p>
          )}

          {/* Action button */}
          {(isActive || stage.status === "pending") && stage.link && (
            <Link href={stage.link}>
              <Button size="sm" className={`mt-3 ${isActive ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-500 hover:bg-amber-600"} text-white`}>
                {stage.linkLabel || "Take Action"} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}

          {isCompleted && stage.id === "application_submitted" && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 font-medium">WhatsApp confirmation sent via Twilio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ApplicationTimeline() {
  const { user, updateUser } = useUser()
  const [tick, setTick] = useState(0)
  const notifiedRef = useRef<Set<string>>(new Set())

  // Auto-simulation: advances stages every 3 seconds in sequence
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      const sim = { ...(user.timelineSimulation || {}) }
      const uploadedDocIds = [...new Set((user.uploadedFiles || []).map((f: any) => f.docId))]
      const allDocsUploaded = REQUIRED_DOCS.every((id: string) => uploadedDocIds.includes(id))
      const now = Date.now()
      let changed = false

      // Stage 2: Docs → auto-complete when all uploaded
      if (allDocsUploaded && sim.docStatus !== "completed") {
        sim.docStatus = "completed"
        sim.docsCompletedAt = now
        if (!notifiedRef.current.has("docs_uploaded")) {
          notifiedRef.current.add("docs_uploaded")
          notify("docs_uploaded", user)
        }
        changed = true
      } else if (!allDocsUploaded && sim.docStatus !== "in-progress" && uploadedDocIds.length > 0) {
        sim.docStatus = "in-progress"
        changed = true
      }

      // Stage 3: Credit Check → starts 3s after docs done
      if (sim.docStatus === "completed" && sim.creditCheckStatus !== "completed") {
        if (!sim.creditCheckStartedAt) {
          sim.creditCheckStartedAt = now
          sim.creditCheckStatus = "in-progress"
          if (!notifiedRef.current.has("credit_check_started")) {
            notifiedRef.current.add("credit_check_started")
            notify("credit_check_started", user)
          }
          changed = true
        } else if (now - sim.creditCheckStartedAt > 8000) {
          sim.creditCheckStatus = "completed"
          sim.creditCheckCompletedAt = now
          if (!notifiedRef.current.has("credit_check_completed")) {
            notifiedRef.current.add("credit_check_completed")
            notify("credit_check_completed", user)
          }
          changed = true
        }
      }

      // Stage 4: Lender Matching → starts 5s after credit done
      if (sim.creditCheckStatus === "completed" && sim.lenderMatchStatus !== "completed") {
        if (!sim.lenderMatchStartedAt) {
          sim.lenderMatchStartedAt = now
          sim.lenderMatchStatus = "in-progress"
          changed = true
        } else if (now - sim.lenderMatchStartedAt > 6000) {
          sim.lenderMatchStatus = "completed"
          sim.lenderMatchCompletedAt = now
          if (!notifiedRef.current.has("lender_match_found")) {
            notifiedRef.current.add("lender_match_found")
            notify("lender_match_found", user)
          }
          changed = true
        }
      }

      // Stage 6: Approval → auto-starts 10s after submission
      if (sim.appSubmitStatus === "completed" && sim.approvalStatus !== "completed") {
        if (!sim.approvalStartedAt) {
          sim.approvalStartedAt = now
          sim.approvalStatus = "in-progress"
          changed = true
        } else if (now - sim.approvalStartedAt > 10000) {
          sim.approvalStatus = "completed"
          sim.approvedAt = now
          if (!notifiedRef.current.has("loan_approved")) {
            notifiedRef.current.add("loan_approved")
            notify("loan_approved", user)
          }
          changed = true
        }
      }

      if (changed) {
        await updateUser({ timelineSimulation: sim })
        setTick(t => t + 1)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [user])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sim = user.timelineSimulation || {}
  const uploadedDocIds = [...new Set((user.uploadedFiles || []).map((f: any) => f.docId))]
  const uploadedCount = REQUIRED_DOCS.filter((id: string) => uploadedDocIds.includes(id)).length
  const allDocsUploaded = uploadedCount === REQUIRED_DOCS.length

  // ─── Build ordered stages ─────────────────────────────────────────────────

  const stages: Stage[] = [
    {
      id: "profile_setup",
      title: "Profile Setup",
      subtitle: "Personal, employment & loan details",
      icon: ClipboardCheck,
      status: "completed",
      date: user.createdAt ? relativeTime(new Date(user.createdAt).getTime()) : "Completed",
      detail: `Welcome, ${user.name || "User"}! Onboarding completed with all loan requirements.`,
    },
    {
      id: "document_upload",
      title: "Document Upload",
      subtitle: `${uploadedCount} / ${REQUIRED_DOCS.length} required documents`,
      icon: FileCheck,
      status: sim.docStatus === "completed"
        ? "completed"
        : uploadedCount > 0
          ? "in-progress"
          : "pending",
      date: sim.docsCompletedAt ? relativeTime(sim.docsCompletedAt) : uploadedCount > 0 ? "In progress..." : undefined,
      detail: allDocsUploaded
        ? "All required documents uploaded and verified. ✓"
        : `Upload ${REQUIRED_DOCS.length - uploadedCount} more document(s): PAN Card, Aadhaar, Salary Slip, Bank Statement.`,
      link: !allDocsUploaded ? "/dashboard/documents" : undefined,
      linkLabel: "Upload Documents",
    },
    {
      id: "credit_check",
      title: "Credit Verification",
      subtitle: "CIBIL / Credit bureau check",
      icon: ShieldCheck,
      status: !allDocsUploaded
        ? "locked"
        : sim.creditCheckStatus === "completed"
          ? "completed"
          : sim.creditCheckStatus === "in-progress"
            ? "in-progress"
            : "pending",
      date: sim.creditCheckCompletedAt ? relativeTime(sim.creditCheckCompletedAt) : undefined,
      detail: !allDocsUploaded
        ? "Locked — Upload all documents first."
        : sim.creditCheckStatus === "completed"
          ? `Credit score verified: ${user.creditScore || "N/A"} (${user.creditScore >= 750 ? "Excellent 🟢" : user.creditScore >= 700 ? "Good 🟡" : "Fair 🟠"})`
          : sim.creditCheckStatus === "in-progress"
            ? "AI is analyzing your credit history with CIBIL bureau..."
            : "Waiting for documents to be verified.",
    },
    {
      id: "lender_matching",
      title: "Lender Matching",
      subtitle: "Finding best loan offers for you",
      icon: TrendingUp,
      status: sim.lenderMatchStatus === "completed"
        ? "completed"
        : sim.lenderMatchStatus === "in-progress"
          ? "in-progress"
          : sim.creditCheckStatus !== "completed"
            ? "locked"
            : "pending",
      date: sim.lenderMatchCompletedAt ? relativeTime(sim.lenderMatchCompletedAt) : undefined,
      detail: sim.lenderMatchStatus === "completed"
        ? "6 lender offers found. HDFC Bank is the recommended offer with 10.5% p.a."
        : sim.lenderMatchStatus === "in-progress"
          ? "Scanning 15+ lenders for your profile..."
          : "Will start automatically after credit check.",
      link: sim.lenderMatchStatus === "completed" ? "/dashboard/loans" : undefined,
      linkLabel: "View Loan Offers",
    },
    {
      id: "application_submitted",
      title: "Application Submitted",
      subtitle: "Submitted to HDFC Bank",
      icon: Building2,
      status: sim.appSubmitStatus === "completed"
        ? "completed"
        : sim.lenderMatchStatus !== "completed"
          ? "locked"
          : "pending",
      date: sim.appSubmittedAt ? relativeTime(sim.appSubmittedAt) : undefined,
      detail: sim.appSubmitStatus === "completed"
        ? "Application sent to HDFC Bank. WhatsApp confirmation delivered via Twilio."
        : sim.lenderMatchStatus === "completed"
          ? "Choose a lender from Loan Offers and click 'Apply at HDFC' to submit."
          : "Waiting for lender matching to complete.",
      link: sim.appSubmitStatus !== "completed" && sim.lenderMatchStatus === "completed" ? "/dashboard/loans" : undefined,
      linkLabel: "Apply Now",
    },
    {
      id: "final_approval",
      title: "Final Approval & Disbursement",
      subtitle: "Loan sanction and money transfer",
      icon: Trophy,
      status: sim.approvalStatus === "completed"
        ? "completed"
        : sim.approvalStatus === "in-progress"
          ? "in-progress"
          : sim.appSubmitStatus !== "completed"
            ? "locked"
            : "pending",
      date: sim.approvedAt ? relativeTime(sim.approvedAt) : undefined,
      detail: sim.approvalStatus === "completed"
        ? `🎊 Congratulations! Loan of ₹${(user.loanAmount || 0).toLocaleString("en-IN")} approved. Disbursement in progress.`
        : sim.approvalStatus === "in-progress"
          ? "HDFC Bank is reviewing your application. Expected within 2–5 working days."
          : "Final approval will begin after application is submitted.",
    },
  ]

  const completedCount = stages.filter(s => s.status === "completed").length
  const overallProgress = Math.round((completedCount / stages.length) * 100)
  const activeStage = stages.find(s => s.status === "in-progress" || s.status === "pending")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Application Timeline</h1>
        <p className="text-gray-500 mt-1 text-sm">Your loan journey — each stage unlocks automatically in sequence.</p>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500 bg-white shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Overall Progress</p>
          <p className="text-3xl font-bold text-gray-900">{overallProgress}%</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500 bg-white shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Stages Complete</p>
          <p className="text-3xl font-bold text-gray-900">{completedCount}<span className="text-base text-gray-400">/{stages.length}</span></p>
          <p className="text-xs text-gray-400 mt-1">stages finished</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Current Stage</p>
          <p className="text-sm font-bold text-gray-900 leading-tight mt-1">{activeStage?.title || "🎉 All Done!"}</p>
          <p className="text-xs text-gray-400 mt-1">{activeStage ? "In Progress" : "Completed"}</p>
        </Card>
      </div>

      {/* ─── Twilio Notice ─── */}
      <div className="bg-[#eef4fc] border border-blue-200 rounded-xl p-3.5 flex items-center gap-3">
        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">WhatsApp notifications active</p>
          <p className="text-xs text-blue-600">Updates will be sent to <strong>{user.phone}</strong> at every milestone via Twilio.</p>
        </div>
      </div>

      {/* ─── Timeline ─── */}
      <div className="pt-2">
        {stages.map((stage, i) => (
          <StageCard key={stage.id} stage={stage} isLast={i === stages.length - 1} />
        ))}
      </div>

      {/* ─── Footer action ─── */}
      {sim.lenderMatchStatus === "completed" && sim.appSubmitStatus !== "completed" && (
        <Card className="p-5 bg-gradient-to-r from-[#1a3a6c] to-blue-700 text-white rounded-2xl shadow-xl">
          <h3 className="font-bold text-lg mb-1">Ready to Apply! 🏦</h3>
          <p className="text-white/80 text-sm mb-4">Your profile is verified and lenders are ready. Click Apply at HDFC to submit your application.</p>
          <Link href="/dashboard/loans">
            <Button className="bg-[#d41e29] hover:bg-[#b01520] text-white font-bold px-6">
              Go to Loan Offers <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
