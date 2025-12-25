"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { OnboardingData } from "../types"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export default function Step5Enhancements({ data, updateData, onNext }: Props) {
  const [documents, setDocuments] = useState({
    salarySlips: false,
    bankStatements: false,
    form16: false,
    addressProof: false,
    idProof: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card className="p-8 shadow-xl border-2 border-emerald-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Boost Your Eligibility</h2>
        <p className="text-gray-600">Optional enhancements to increase approval odds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Joint Application */}
        <div className="bg-emerald-50 p-6 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="joint" className="text-base font-semibold">
                Joint Application
              </Label>
              <p className="text-sm text-gray-600 mt-1">Adding a co-borrower can increase your eligibility by 40-60%</p>
            </div>
            <Switch
              id="joint"
              checked={data.isJointApplication || false}
              onCheckedChange={(checked) => updateData({ isJointApplication: checked })}
            />
          </div>

          {/* Co-borrower Details (conditional) */}
          {data.isJointApplication && (
            <div className="space-y-4 mt-4 pt-4 border-t border-emerald-300">
              <div>
                <Label htmlFor="coborrowerIncome" className="text-sm font-semibold">
                  Co-borrower Monthly Income
                </Label>
                <Input
                  id="coborrowerIncome"
                  type="number"
                  placeholder="₹30,000"
                  value={data.coborrowerIncome || ""}
                  onChange={(e) => updateData({ coborrowerIncome: Number.parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="relationship" className="text-sm font-semibold">
                  Relationship
                </Label>
                <Select
                  value={data.coborrowerRelationship || ""}
                  onValueChange={(value) => updateData({ coborrowerRelationship: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Document Availability */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Document Availability Checklist</Label>
          <p className="text-sm text-gray-600 mb-4">
            Select documents you already have ready. This improves your document readiness score.
          </p>

          <div className="space-y-3">
            {[
              { id: "salarySlips", label: "Salary Slips (Last 3 months)" },
              { id: "bankStatements", label: "Bank Statements (Last 6 months)" },
              { id: "form16", label: "Form 16" },
              { id: "addressProof", label: "Address Proof" },
              { id: "idProof", label: "ID Proof (Aadhaar/PAN)" },
            ].map((doc) => (
              <div
                key={doc.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={doc.id}
                  checked={documents[doc.id as keyof typeof documents]}
                  onCheckedChange={(checked) => setDocuments({ ...documents, [doc.id]: checked as boolean })}
                />
                <Label htmlFor={doc.id} className="flex-1 cursor-pointer text-sm font-medium">
                  {doc.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-lg font-semibold group"
        >
          <CheckCircle2 className="mr-2 w-5 h-5" />
          Check My Eligibility
        </Button>

        <p className="text-center text-sm text-gray-500">This will take just a few seconds...</p>
      </form>
    </Card>
  )
}
