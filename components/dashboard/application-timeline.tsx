"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar, FileCheck, TrendingUp, Award, Upload } from "lucide-react"

export default function ApplicationTimeline() {
  const [timeline, setTimeline] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  // 1. Initial Data Load
  useEffect(() => {
    const files = localStorage.getItem("uploadedFiles")
    if (files) {
      setUploadedFiles(JSON.parse(files))
    }
  }, [])

  // 2. Timeline Simulation Engine
  useEffect(() => {
    const profileData = localStorage.getItem("onboardingData")
    const userProfile = profileData ? JSON.parse(profileData) : {}
    const creditScore = userProfile.creditScore || 750

    const requiredDocs = ["pan", "aadhaar", "utility", "salary-slip", "bank-statement"]
    const uploadedDocIds = [...new Set(uploadedFiles.map((f: any) => f.docId))]
    const docProgress = requiredDocs.length > 0 ? Math.min(uploadedDocIds.length / requiredDocs.length, 1) : 0

    const simState = JSON.parse(localStorage.getItem("timelineSimulation") || "{}")

    let creditCheckStatus = "pending"
    let lenderMatchStatus = "pending"
    let appSubmitStatus = "pending"
    let approvalStatus = "pending"

    // Notification Helper
    const notifyUser = async (stage: string) => {
      const simState = JSON.parse(localStorage.getItem("timelineSimulation") || "{}")
      console.log(`[Timeline] Checking notification for ${stage}. Already notified?`, simState[`notified_${stage}`])

      if (simState[`notified_${stage}`]) return

      try {
        console.log(`[Timeline] Triggering notification for ${stage}...`)
        const res = await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage,
            userData: { name: userProfile.name, phone: userProfile.phone, creditScore }
          })
        })
        const data = await res.json()
        console.log(`[Timeline] Notification API response:`, data)

        // Only mark as notified if the API actually succeeded
        if (data.success) {
          localStorage.setItem("timelineSimulation", JSON.stringify({ ...JSON.parse(localStorage.getItem("timelineSimulation") || "{}"), [`notified_${stage}`]: true }))
        } else {
          console.warn(`[Timeline] Notification failed (API returned success: false). Will retry on next load. Reason: ${data.error || 'Unknown'}`)
        }
      } catch (e) {
        console.error("Notify failed", e)
      }
    }

    // STAGE 1: Profile Setup (Immediate)
    if (userProfile.name) {
      notifyUser("profile_setup")
    }

    // STAGE 2: Documents
    const docStatus = docProgress === 1 ? "completed" : docProgress > 0 ? "in-progress" : "pending"
    // Trigger if at least one doc is uploaded
    if (docStatus === "completed" || docStatus === "in-progress") notifyUser("docs_uploaded")

    // STAGE 3: Credit Check
    if (docProgress > 0.4) {
      if (!simState.creditCheckStarted) {
        simState.creditCheckStarted = Date.now()
        localStorage.setItem("timelineSimulation", JSON.stringify(simState))
        notifyUser("credit_check_started")
      }
      const elapsed = Date.now() - simState.creditCheckStarted
      creditCheckStatus = elapsed > 5000 ? "completed" : "in-progress"
      if (creditCheckStatus === "completed") notifyUser("credit_check_completed")
    }

    // STAGE 4: Lender Matching
    if (creditCheckStatus === "completed") {
      if (!simState.matchingStarted) {
        simState.matchingStarted = Date.now()
        localStorage.setItem("timelineSimulation", JSON.stringify(simState))
      }
      const elapsed = Date.now() - simState.matchingStarted
      lenderMatchStatus = elapsed > 4000 ? "completed" : "in-progress"
      if (lenderMatchStatus === "completed") notifyUser("lender_match_found")
    }

    // STAGE 5: Submission
    if (simState.applicationSubmitted) {
      appSubmitStatus = "completed"
      notifyUser("application_submitted")
    } else if (lenderMatchStatus === "completed") {
      appSubmitStatus = "in-progress"
    }

    // STAGE 6: Approval
    if (appSubmitStatus === "completed") {
      if (!simState.approvalStarted) {
        simState.approvalStarted = Date.now()
        localStorage.setItem("timelineSimulation", JSON.stringify(simState))
      }
      const elapsed = Date.now() - simState.approvalStarted
      if (creditScore > 750) {
        approvalStatus = elapsed > 6000 ? "completed" : "in-progress"
        if (approvalStatus === "completed") notifyUser("loan_approved")
      } else {
        approvalStatus = "in-progress"
      }
    }

    setTimeline([
      {
        stage: "Profile Setup",
        status: "completed",
        date: "Completed",
        description: "Basic information and loan requirements submitted",
        actions: [],
      },
      {
        stage: "Document Upload",
        status: docStatus,
        date: docStatus === "completed" ? "Completed" : "In Progress",
        description: "Upload required documents",
        actions: requiredDocs.map(id => ({
          name: getDocumentName(id),
          status: uploadedDocIds.includes(id) ? "completed" : "pending"
        })),
      },
      {
        stage: "Credit Check",
        status: creditCheckStatus,
        date: creditCheckStatus === "completed" ? "Verified" : creditCheckStatus === "in-progress" ? "Processing..." : `Est. ${getEstimatedDate(1)}`,
        description: creditCheckStatus === "completed" ? `Score Verified: ${creditScore}` : "Checking credit history",
        actions: [],
      },
      {
        stage: "Lender Matching",
        status: lenderMatchStatus,
        date: lenderMatchStatus === "completed" ? "Match Found" : lenderMatchStatus === "in-progress" ? "Searching..." : `Est. ${getEstimatedDate(2)}`,
        description: "Finding best loan offers",
        actions: [],
      },
      {
        stage: "Application Submission",
        status: appSubmitStatus,
        date: appSubmitStatus === "completed" ? "Submitted" : `Est. ${getEstimatedDate(3)}`,
        description: "Submitting to selected banks",
        actions: [],
      },
      {
        stage: "Final Approval",
        status: approvalStatus,
        date: approvalStatus === "completed" ? "Approved" : `Est. ${getEstimatedDate(5)}`,
        description: "Loan sanction and disbursement",
        actions: [],
      },
    ])

    // Refresh timer
    const interval = setInterval(() => {
      setTimeline(prev => [...prev])
    }, 1000)
    return () => clearInterval(interval)

  }, [uploadedFiles])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-600 bg-emerald-100 border-emerald-200"
      case "in-progress": return "text-blue-600 bg-blue-100 border-blue-200"
      default: return "text-gray-400 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    if (status === "in-progress") return <Clock className="w-5 h-5 text-blue-600 animate-spin-slow" /> // Custom slow spin if defined, or standard
    return <Circle className="w-5 h-5 text-gray-300" />
  }

  const completedStages = timeline.filter((t) => t.status === "completed").length
  const progress = timeline.length > 0 ? (completedStages / timeline.length) * 100 : 0

  const [isRefreshing, setIsRefreshing] = useState(false)
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Timeline</h1>
          <p className="text-gray-600">Track your loan application progress in real-time</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="group border-emerald-200 hover:bg-emerald-50 text-emerald-700"
        >
          <Clock className={`w-4 h-4 mr-2 group-hover:text-emerald-600 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Syncing..." : "Refresh Status"}
        </Button>
      </div>

      {/* 2. Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <Card className="p-6 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Progress</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900">{Math.round(progress)}%</span>
            <span className="text-sm text-gray-500 mb-1">completed</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* Next Milestone */}
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Next Milestone</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 line-clamp-1">
            {timeline.find(t => t.status === "in-progress")?.stage || "All Completed"}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Est. {getEstimatedDate(1)}
          </p>
        </Card>

        {/* Action Items */}
        <Card className="p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Pending Actions</span>
            <AlertCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {timeline.reduce((acc, step) => acc + step.actions.filter((a: any) => a.status !== 'completed').length, 0)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Requires your attention</p>
        </Card>
      </div>

      <div className="space-y-6">
        {timeline.map((item, index) => (
          <Card key={index} className={`p-6 ${item.status === "in-progress" ? "border-2 border-emerald-500" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {item.status === "completed" ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                ) : item.status === "in-progress" ? (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Circle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.stage}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{item.description}</p>

                {item.actions.length > 0 && (
                  <div className="space-y-2">
                    {item.actions.map((action: any, actionIndex: number) => (
                      <div key={actionIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {action.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : action.status === "action_needed" ? (
                            <TrendingUp className="w-5 h-5 text-emerald-600 animate-bounce" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          )}
                          <span className="font-medium text-gray-900">{action.name}</span>
                        </div>

                        {/* Document Upload Button */}
                        {action.status === "pending" && item.stage === "Document Upload" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => (window.location.href = "/dashboard/documents")}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload
                          </Button>
                        )}

                        {/* Submit Application Button */}
                        {action.status === "action_needed" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg animate-pulse"
                            onClick={() => {
                              const simState = JSON.parse(localStorage.getItem("timelineSimulation") || "{}")
                              localStorage.setItem("timelineSimulation", JSON.stringify({ ...simState, applicationSubmitted: true }))
                              // Force re-render
                              setTimeline([...timeline])
                            }}
                          >
                            Submit Now
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {item.status === "in-progress" && item.actions.length === 0 && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Continue</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-start gap-4">
          <FileCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Keep Your Documents Ready</h3>
            <p className="text-sm text-gray-700 mb-3">
              To speed up the process, keep these documents scanned and ready: PAN card, Aadhaar, salary slips (last 3
              months), and bank statements (last 6 months).
            </p>
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => (window.location.href = "/dashboard/documents")}
            >
              View Complete Checklist
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getDocumentName(docId: string): string {
  const names: Record<string, string> = {
    pan: "PAN Card",
    aadhaar: "Aadhaar Card",
    passport: "Passport",
    utility: "Utility Bill",
    rent: "Rent Agreement",
    "salary-slip": "Salary Slips",
    "bank-statement": "Bank Statement",
    form16: "Form 16 / ITR",
    "property-docs": "Property Papers",
    noc: "NOC from Society",
  }
  return names[docId] || docId
}

function getEstimatedDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
