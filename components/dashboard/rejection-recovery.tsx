"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ShieldX, TrendingUp, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, RefreshCw } from "lucide-react"

type RejectionReason = {
  id: string
  reason: string
  severity: "high" | "medium" | "low"
  improvementTime: string
  actions: { action: string; impact: number }[]
}

function analyzeUserProfile(userData: any): RejectionReason[] {
  const reasons: RejectionReason[] = []

  const monthlyIncome = Number(userData.monthlyIncome) || 0
  const existingEMI = Number(userData.existingEMI) || 0
  const creditScore = Number(userData.creditScore) || 650
  const hasCreditHistory = userData.hasCreditHistory ?? true
  const employmentTenure = userData.employmentTenure || ""
  const dti = monthlyIncome > 0 ? (existingEMI / monthlyIncome) * 100 : 0

  // Analyze credit score
  if (!hasCreditHistory || creditScore < 650) {
    reasons.push({
      id: "low-cibil",
      reason: `Low CIBIL Score (${hasCreditHistory ? creditScore : "No History"})`,
      severity: "high",
      improvementTime: "3-6 months",
      actions: [
        { action: "Pay all EMIs on time for 3 months", impact: 30 },
        { action: "Reduce credit card utilization below 30%", impact: 25 },
        { action: "Don't apply for new credit for 6 months", impact: 15 },
      ],
    })
  }

  // Analyze DTI
  if (dti > 50) {
    reasons.push({
      id: "high-dti",
      reason: `High Debt-to-Income Ratio (${dti.toFixed(1)}%)`,
      severity: "high",
      improvementTime: "2-4 months",
      actions: [
        { action: "Pay off smallest loan first", impact: 35 },
        { action: "Consider balance transfer to lower EMI", impact: 20 },
        { action: "Increase income through side gig", impact: 25 },
      ],
    })
  }

  // Analyze income
  if (monthlyIncome < 25000) {
    reasons.push({
      id: "insufficient-income",
      reason: `Insufficient Monthly Income (₹${monthlyIncome.toLocaleString("en-IN")})`,
      severity: "medium",
      improvementTime: "1-3 months",
      actions: [
        { action: "Add co-applicant with stable income", impact: 40 },
        { action: "Include all income sources in application", impact: 20 },
        { action: "Wait for salary increment", impact: 15 },
      ],
    })
  }

  // Analyze employment stability
  if (employmentTenure === "<6_months" || employmentTenure === "6m-1yr") {
    reasons.push({
      id: "employment-stability",
      reason: "Employment Stability Issues",
      severity: "medium",
      improvementTime: "6-12 months",
      actions: [
        { action: "Complete 1 year at current employer", impact: 35 },
        { action: "Get employment letter from HR", impact: 15 },
        { action: "Show consistent bank credits", impact: 20 },
      ],
    })
  }

  // If no issues found, provide general improvement tips
  if (reasons.length === 0) {
    reasons.push({
      id: "general-improvement",
      reason: "Profile Improvement Opportunities",
      severity: "low",
      improvementTime: "1-2 months",
      actions: [
        { action: "Build credit score above 750 for better rates", impact: 25 },
        { action: "Maintain DTI below 40% for best offers", impact: 20 },
        { action: "Keep employment stable for 2+ years", impact: 15 },
      ],
    })
  }

  return reasons
}

export default function RejectionRecovery() {
  const [availableReasons, setAvailableReasons] = useState<RejectionReason[]>([])
  const [selectedReason, setSelectedReason] = useState<RejectionReason | null>(null)
  const [recoveryProgress, setRecoveryProgress] = useState(0)
  const [completedActions, setCompletedActions] = useState<string[]>([])

  useEffect(() => {
    const fetchRecoveryPlan = async () => {
      const data = localStorage.getItem("onboardingData")
      if (data) {
        const userData = JSON.parse(data)

        try {
          // Call the Recovery Agent API
          const response = await fetch("/api/rejection-recovery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          })

          if (response.ok) {
            const plan = await response.json()
            if (plan.analysis) {
              setAvailableReasons(plan.analysis)
            } else {
              throw new Error("Invalid API response format")
            }
          } else {
            // Silently fall back to local logic (Simulation Mode)
            console.warn("Rejection Recovery API unavailable (Simulation Mode Active)")
            const reasons = analyzeUserProfile(userData)
            setAvailableReasons(reasons)
          }
        } catch (error) {
          // Graceful degradation - do not crash
          console.log("Using offline analysis (Simulation Mode)")
          const reasons = analyzeUserProfile(userData)
          setAvailableReasons(reasons)
        }
      }
    }

    fetchRecoveryPlan()

    // Load saved recovery progress
    const saved = localStorage.getItem("rejectionRecovery")
    if (saved) {
      const recoveryData = JSON.parse(saved)
      // We need to wait for reasons to be loaded, but since this is effect-based, 
      // we might need to adjust logic. For now, we trust the ID matches.
    }
  }, [])

  useEffect(() => {
    if (selectedReason && availableReasons.length > 0) {
      // Re-link selected reason if needed
      const fullReason = availableReasons.find(r => r.id === selectedReason.id)
      if (fullReason && fullReason !== selectedReason) {
        setSelectedReason(fullReason)
      }

      const totalImpact = selectedReason.actions.reduce((sum, a) => sum + a.impact, 0)
      const completedImpact = selectedReason.actions
        .filter((a) => completedActions.includes(a.action))
        .reduce((sum, a) => sum + a.impact, 0)
      setRecoveryProgress((completedImpact / totalImpact) * 100)
    }
  }, [selectedReason, completedActions, availableReasons])

  const toggleAction = (action: string) => {
    setCompletedActions((prev) => {
      const newActions = prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]

      if (selectedReason) {
        localStorage.setItem(
          "rejectionRecovery",
          JSON.stringify({
            reasonId: selectedReason.id,
            completedActions: newActions,
          }),
        )
      }

      return newActions
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-orange-600 bg-orange-50"
      case "low":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldX className="w-8 h-8 text-red-500" />
          Rejection Recovery
        </h1>
        <p className="text-gray-600 mt-2">Understand your profile weaknesses and follow the improvement roadmap</p>
      </div>

      {/* Rejection Shield Banner */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">Profile Analysis Active</h3>
            <p className="text-gray-600 mt-1">
              Based on your profile, we've identified {availableReasons.length} area
              {availableReasons.length !== 1 ? "s" : ""} for improvement. Select one below to create your action plan.
            </p>
          </div>
        </div>
      </Card>

      {/* Select Rejection Reason */}
      {!selectedReason ? (
        <div className="grid md:grid-cols-2 gap-4">
          {availableReasons.map((reason) => (
            <motion.div key={reason.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="p-6 cursor-pointer hover:border-emerald-300 transition-all"
                onClick={() => setSelectedReason(reason)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(reason.severity)}`}>
                    {reason.severity === "high" ? "Critical" : reason.severity === "medium" ? "Moderate" : "Minor"}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{reason.reason}</h3>
                <p className="text-sm text-gray-500">Recovery time: {reason.improvementTime}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Reason Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedReason.severity)}`}
                >
                  {selectedReason.severity === "high"
                    ? "Critical"
                    : selectedReason.severity === "medium"
                      ? "Moderate"
                      : "Minor"}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-3">{selectedReason.reason}</h2>
                <p className="text-gray-600 mt-1">Estimated recovery time: {selectedReason.improvementTime}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedReason(null)
                  setCompletedActions([])
                  localStorage.removeItem("rejectionRecovery")
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Change
              </Button>
            </div>

            {/* Recovery Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Recovery Progress</span>
                <span className="text-sm font-semibold text-emerald-600">{Math.round(recoveryProgress)}%</span>
              </div>
              <Progress value={recoveryProgress} className="h-3" />
            </div>

            {/* Improvement Roadmap */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Improvement Roadmap
              </h3>
              <div className="space-y-3">
                {selectedReason.actions.map((action, idx) => (
                  <motion.div
                    key={action.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${completedActions.includes(action.action)
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-gray-50 border-gray-200 hover:border-emerald-200"
                      }`}
                    onClick={() => toggleAction(action.action)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${completedActions.includes(action.action)
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-500"
                          }`}
                      >
                        {completedActions.includes(action.action) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${completedActions.includes(action.action) ? "text-emerald-700 line-through" : "text-gray-900"
                            }`}
                        >
                          {action.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-emerald-600">+{action.impact}% impact</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {recoveryProgress >= 70 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-800 text-lg">You're ready to reapply!</h3>
                    <p className="text-emerald-600 mt-1">Your improvements have increased your approval chances.</p>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
