"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar, FileCheck, TrendingUp, Award, Upload, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ApplicationTimeline() {
  const { user, updateUser } = useUser()
  const [timeline, setTimeline] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Hydrate timeline from user state
  useEffect(() => {
    if (!user) return

    const simState = user.timelineSimulation || {}
    const uploadedFiles = user.uploadedFiles || []

    // Logic to determine stage statuses based on persisted state
    const requiredDocs = ["pan", "aadhaar", "salary-slip", "bank-statement"]
    const uploadedDocIds = [...new Set(uploadedFiles.map((f: any) => f.docId))]
    const docProgress = requiredDocs.length > 0 ? Math.min(uploadedDocIds.length / requiredDocs.length, 1) : 0

    // Auto-update Doc Status in Simulation if not set
    if (docProgress > 0 && simState.docStatus !== 'completed') {
      if (docProgress === 1 && simState.docStatus !== 'completed') {
        simState.docStatus = 'completed'
        simState.docsCompletedAt = Date.now()
        updateUser({ timelineSimulation: simState }) // Persist
      } else if (simState.docStatus !== 'in-progress') {
        simState.docStatus = 'in-progress'
        updateUser({ timelineSimulation: simState }) // Persist
      }
    }

    // Build the View Model
    const newTimeline = [
      {
        stage: "Profile Setup",
        status: "completed",
        date: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Completed",
        description: "Basic information and loan requirements submitted",
        actions: [],
      },
      {
        stage: "Document Upload",
        status: simState.docStatus || (docProgress > 0 ? "in-progress" : "pending"),
        date: simState.docsCompletedAt ? new Date(simState.docsCompletedAt).toLocaleDateString() : (docProgress > 0 ? "In Progress" : "Pending"),
        description: "Upload required documents",
        actions: requiredDocs.map(id => ({
          name: getDocumentName(id),
          status: uploadedDocIds.includes(id) ? "completed" : "pending"
        })),
        link: "/dashboard/documents"
      },
      {
        stage: "Credit Check",
        status: simState.creditCheckStatus || "pending",
        date: simState.creditCheckCompletedAt ? new Date(simState.creditCheckCompletedAt).toLocaleDateString() : "Pending",
        description: simState.creditCheckStatus === "completed" ? `Score Verified: ${user.creditScore}` : "Checking credit history",
        actions: [],
      },
      {
        stage: "Lender Matching",
        status: simState.lenderMatchStatus || "pending",
        date: simState.lenderMatchCompletedAt ? new Date(simState.lenderMatchCompletedAt).toLocaleDateString() : "Pending",
        description: "Finding best loan offers",
        actions: [],
      },
      {
        stage: "Application Submission",
        status: simState.appSubmitStatus || "pending",
        date: simState.appSubmittedAt ? new Date(simState.appSubmittedAt).toLocaleDateString() : "Pending",
        description: "Submitting to selected banks",
        actions: [],
      },
      {
        stage: "Final Approval",
        status: simState.approvalStatus || "pending",
        date: simState.approvedAt ? new Date(simState.approvedAt).toLocaleDateString() : "Pending",
        description: "Loan sanction and disbursement",
        actions: [],
      },
    ]

    setTimeline(newTimeline)

    // Run Simulation Logic (The "Game Loop")
    const runSimulation = async () => {
      let changed = false
      const now = Date.now()

      // 1. Credit Check Automation
      if (simState.docStatus === 'completed' && simState.creditCheckStatus !== 'completed') {
        if (!simState.creditCheckStartedAt) {
          simState.creditCheckStartedAt = now
          simState.creditCheckStatus = 'in-progress'
          changed = true
        } else if (now - simState.creditCheckStartedAt > 5000) {
          simState.creditCheckStatus = 'completed'
          simState.creditCheckCompletedAt = now
          // Trigger Check Notification
          await notifyUser("credit_check_completed", user)
          changed = true
        }
      }

      // 2. Lender Matching Automation
      if (simState.creditCheckStatus === 'completed' && simState.lenderMatchStatus !== 'completed') {
        if (!simState.lenderMatchStartedAt) {
          simState.lenderMatchStartedAt = now
          simState.lenderMatchStatus = 'in-progress'
          changed = true
        } else if (now - simState.lenderMatchStartedAt > 4000) {
          simState.lenderMatchStatus = 'completed'
          simState.lenderMatchCompletedAt = now
          await notifyUser("lender_match_found", user)
          changed = true
        }
      }

      // 3. Approval Automation (Only if submitted)
      if (simState.appSubmitStatus === 'completed' && simState.approvalStatus !== 'completed') {
        if (!simState.approvalStartedAt) {
          simState.approvalStartedAt = now
          simState.approvalStatus = 'in-progress'
          changed = true
        } else if (now - simState.approvalStartedAt > 8000) {
          simState.approvalStatus = 'completed'
          simState.approvedAt = now
          await notifyUser("loan_approved", user)
          changed = true
        }
      }

      if (changed) {
        updateUser({ timelineSimulation: simState })
      }
    }

    const timer = setInterval(runSimulation, 2000)
    return () => clearInterval(timer)

  }, [user])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Force a re-sync or just visual feedback
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Calculate stats for dashboard cards
  const completedStages = timeline.filter((t) => t.status === "completed").length
  const progress = timeline.length > 0 ? (completedStages / timeline.length) * 100 : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Timeline</h1>
          <p className="text-gray-600">Track your loan application progress in real-time</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="group border-blue-200 hover:bg-blue-50 text-blue-700"
        >
          <Clock className={`w-4 h-4 mr-2 group-hover:text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Syncing..." : "Refresh Status"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard color="blue" icon={TrendingUp} label="Total Progress" value={`${Math.round(progress)}%`} sub="completed" progress={progress} />
        <GlassCard color="indigo" icon={Clock} label="Next Milestone" value={timeline.find(t => t.status === "in-progress" || t.status === "pending")?.stage || "All Done"} sub="In Progress" />
        <GlassCard color="purple" icon={AlertCircle} label="Pending Actions" value={timeline.reduce((acc, step) => acc + step.actions.filter((a: any) => a.status !== 'completed').length, 0)} sub="Requires attention" />
      </div>

      {/* Timeline Items */}
      <div className="space-y-6 relative">
        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />

        {timeline.map((item, index) => (
          <TimelineItem key={index} item={item} />
        ))}
      </div>

      {/* Document CTA */}
      <Card className="glass-card p-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white/50 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <FileCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Documents Required</h3>
            <p className="text-sm text-gray-600 mb-3">Ensure all documents are clear and valid. Verification takes 2-3 minutes.</p>
            <Link href="/dashboard/documents">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">View Checklist</Button>
            </Link>
          </div>
        </div>
      </Card>

    </div>
  )
}

// Components

function GlassCard({ color, icon: Icon, label, value, sub, progress }: any) {
  const colors: any = {
    blue: "border-l-blue-500 text-blue-500",
    indigo: "border-l-indigo-500 text-indigo-500",
    purple: "border-l-purple-500 text-purple-500",
  }

  return (
    <Card className={`p-6 border-l-4 ${colors[color]} shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <Icon className={`w-5 h-5 ${colors[color].split(" ")[1]}`} />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500 mb-1">{sub}</span>
      </div>
      {typeof progress === 'number' && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
    </Card>
  )
}

function TimelineItem({ item }: any) {
  const isCompleted = item.status === "completed"
  const isInProgress = item.status === "in-progress"

  return (
    <Card className={`p-6 ml-0 md:ml-0 transition-all ${isInProgress ? "border-blue-400 ring-4 ring-blue-50 shadow-lg scale-[1.01]" : "border-gray-100 shadow-sm"}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          {isCompleted ? (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          ) : isInProgress ? (
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm animate-pulse">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white">
              <Circle className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <h3 className={`text-lg font-bold ${isCompleted ? "text-gray-900" : isInProgress ? "text-blue-700" : "text-gray-500"}`}>
              {item.stage}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{item.date}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 text-sm">{item.description}</p>

          {/* Actions List */}
          {item.actions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {item.actions.map((action: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
                  {action.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-300" />}
                  <span className={`text-sm ${action.status === 'completed' ? "text-gray-700 font-medium" : "text-gray-500"}`}>{action.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          {isInProgress && item.link && (
            <Link href={item.link}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 mt-2">
                Complete Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}

function getDocumentName(id: string) {
  const map: any = { "pan": "PAN Card", "aadhaar": "Aadhaar Card", "salary-slip": "Salary Slip", "bank-statement": "Bank Statement" }
  return map[id] || id
}

async function notifyUser(stage: string, user: any) {
  // Send only if not already notified (handled in component logic via state check usually, but here just firing)
  // In a real app we'd check `simState.notified_X`
  try {
    await fetch("/api/notify", {
      method: "POST",
      body: JSON.stringify({ stage, userData: { name: user.name, phone: user.phone } })
    })
  } catch (e) { console.error(e) }
}
