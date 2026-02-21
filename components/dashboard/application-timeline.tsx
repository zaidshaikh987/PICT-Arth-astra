"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar, FileCheck, TrendingUp, Award, Upload } from "lucide-react"

export default function ApplicationTimeline() {
  const [timeline, setTimeline] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  useEffect(() => {
    const files = localStorage.getItem("uploadedFiles")
    if (files) {
      const parsedFiles = JSON.parse(files)
      setUploadedFiles(parsedFiles)

      // Build timeline based on real uploaded documents
      const requiredDocs = ["pan", "aadhaar", "utility", "salary-slip", "bank-statement", "form16"]
      const uploadedDocIds = [...new Set(parsedFiles.map((f: any) => f.docId))]

      const docActions = requiredDocs.map((docId) => ({
        name: getDocumentName(docId),
        status: uploadedDocIds.includes(docId) ? "completed" : "pending",
      }))

      const completedDocs = docActions.filter((a) => a.status === "completed").length
      const docProgress = completedDocs / requiredDocs.length

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
          status: docProgress === 1 ? "completed" : docProgress > 0 ? "in-progress" : "pending",
          date: docProgress === 1 ? "Completed" : "In Progress",
          description: "Upload required documents for verification",
          actions: docActions,
        },
        {
          stage: "Credit Check",
          status: docProgress === 1 ? "in-progress" : "pending",
          date: docProgress === 1 ? "In Progress" : "Pending",
          description: "Soft credit check will be performed",
          actions: [],
        },
        {
          stage: "Lender Matching",
          status: "pending",
          date: "Pending",
          description: "Finding best loan offers based on your profile",
          actions: [],
        },
        {
          stage: "Application Submission",
          status: "pending",
          date: "Pending",
          description: "Submit applications to selected lenders",
          actions: [],
        },
        {
          stage: "Approval & Disbursal",
          status: "pending",
          date: "Pending",
          description: "Final approval and loan amount transfer",
          actions: [],
        },
      ])
    } else {
      // Default timeline if no files
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
          status: "pending",
          date: "Pending",
          description: "Upload required documents for verification",
          actions: [
            { name: "Income Proof", status: "pending" },
            { name: "Identity Proof", status: "pending" },
            { name: "Address Proof", status: "pending" },
            { name: "Bank Statements", status: "pending" },
          ],
        },
        {
          stage: "Credit Check",
          status: "pending",
          date: "Pending",
          description: "Soft credit check will be performed",
          actions: [],
        },
        {
          stage: "Lender Matching",
          status: "pending",
          date: "Pending",
          description: "Finding best loan offers based on your profile",
          actions: [],
        },
        {
          stage: "Application Submission",
          status: "pending",
          date: "Pending",
          description: "Submit applications to selected lenders",
          actions: [],
        },
        {
          stage: "Approval & Disbursal",
          status: "pending",
          date: "Pending",
          description: "Final approval and loan amount transfer",
          actions: [],
        },
      ])
    }
  }, [])

  const completedStages = timeline.filter((t) => t.status === "completed").length
  const progress = timeline.length > 0 ? (completedStages / timeline.length) * 100 : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Timeline</h1>
        <p className="text-gray-600">Track your loan application progress step by step</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-2 border-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Overall Progress</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-2">{Math.round(progress)}%</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {completedStages}/{timeline.length}
          </div>
          <p className="text-xs text-gray-600 mt-1">Stages completed</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Estimated Time</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {Math.max(1, 7 - completedStages * 2)}-{Math.max(3, 10 - completedStages * 2)}
          </div>
          <p className="text-xs text-gray-600 mt-1">Days remaining</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Documents</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{uploadedFiles.length}</div>
          <p className="text-xs text-gray-600 mt-1">Files uploaded</p>
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
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          )}
                          <span className="font-medium text-gray-900">{action.name}</span>
                        </div>
                        {action.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => (window.location.href = "/dashboard/documents")}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload
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
