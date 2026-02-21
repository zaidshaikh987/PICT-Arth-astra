"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Download,
} from "lucide-react"
import { calculateDetailedEligibility } from "@/lib/tools/eligibility-calculator"

export default function EligibilityReport() {
  const [report, setReport] = useState<any>(null)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      const result = calculateDetailedEligibility(user)
      setReport(result)
    }
  }, [user])

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eligibility Report</h1>
          <p className="text-gray-600">Comprehensive analysis of your loan application</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Overall Status</h3>
            {report.overallStatus === "approved" ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : report.overallStatus === "review" ? (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div
            className={`text-2xl font-bold mb-2 ${report.overallStatus === "approved"
              ? "text-green-600"
              : report.overallStatus === "review"
                ? "text-yellow-600"
                : "text-red-600"
              }`}
          >
            {report.overallStatus === "approved"
              ? "Eligible"
              : report.overallStatus === "review"
                ? "Under Review"
                : "Not Eligible"}
          </div>
          <p className="text-sm text-gray-600">{report.statusMessage}</p>
        </Card>

        <Card className="p-6 border-2 border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Max Loan Amount</h3>
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600 mb-2">₹{report.maxAmount.toLocaleString("en-IN")}</div>
          <p className="text-sm text-gray-600">Based on your income & profile</p>
        </Card>

        <Card className="p-6 border-2 border-cyan-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Approval Odds</h3>
            <Percent className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="text-3xl font-bold text-cyan-600 mb-2">{report.approvalOdds}%</div>
          <Progress value={report.approvalOdds} className="h-2" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Eligibility Factors</h3>
          <div className="space-y-4">
            {report.factors.map((factor: any, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${factor.status === "pass"
                    ? "bg-green-100"
                    : factor.status === "warning"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                    }`}
                >
                  {factor.status === "pass" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : factor.status === "warning" ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{factor.name}</h4>
                    <span className="text-sm font-medium text-gray-600">{factor.score}/100</span>
                  </div>
                  <Progress value={factor.score} className="h-2 mb-2" />
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Income</span>
                <span className="font-bold text-gray-900">
                  ₹{report.financials.monthlyIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Existing EMI</span>
                <span className="font-bold text-gray-900">
                  ₹{report.financials.existingEMI.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Expenses</span>
                <span className="font-bold text-gray-900">
                  ₹{report.financials.monthlyExpenses.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Available for EMI</span>
                <span className="font-bold text-blue-600">
                  ₹{report.financials.availableForEMI.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Debt-to-Income Ratio</span>
                <span
                  className={`font-bold ${report.financials.dti > 50 ? "text-red-600" : report.financials.dti > 40 ? "text-yellow-600" : "text-blue-600"}`}
                >
                  {report.financials.dti.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(report.financials.dti, 100)} className="h-2 mb-2" />
              <p className="text-xs text-gray-600">
                {report.financials.dti > 50
                  ? "High DTI - Consider reducing existing debt"
                  : report.financials.dti > 40
                    ? "Moderate DTI - Room for improvement"
                    : "Healthy DTI - Good financial position"}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Estimated Monthly EMI</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ₹{report.financials.estimatedEMI.toLocaleString("en-IN")}
              </div>
              <p className="text-sm text-gray-600">
                For ₹{report.maxAmount.toLocaleString("en-IN")} at {report.financials.interestRate}% for{" "}
                {report.financials.tenure} years
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recommendations to Improve</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.recommendations.map((rec: any, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
            >
              {rec.impact === "high" ? (
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingDown className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {rec.impact === "high" ? "+15-20% approval odds" : "+5-10% approval odds"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}


