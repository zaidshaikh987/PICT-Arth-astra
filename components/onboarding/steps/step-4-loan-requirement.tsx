"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import type { OnboardingData } from "../types"
import {
  ArrowRight,
  GraduationCap,
  User,
  Briefcase,
  Home,
  Car,
  Heart,
  Users,
  Plane,
  Calculator,
  CheckCircle2,
} from "lucide-react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

const loanPurposes = [
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "personal", label: "Personal", icon: User },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "home", label: "Home", icon: Home },
  { value: "car", label: "Car", icon: Car },
  { value: "medical", label: "Medical", icon: Heart },
  { value: "wedding", label: "Wedding", icon: Users },
  { value: "travel", label: "Travel", icon: Plane },
]

const LOAN_FIELDS = [
  { key: "loanAmount", label: "Loan Amount", description: "Total money you need" },
  { key: "preferredEMI", label: "Max Monthly EMI", description: "What you can pay per month" },
  { key: "tenure", label: "Preferred Tenure", description: "Loan duration in years" },
] as const

type LoanFieldKey = (typeof LOAN_FIELDS)[number]["key"]

const tenureOptions = [1, 2, 3, 5, 7, 10]

export default function Step4LoanRequirement({ data, updateData, onNext }: Props) {
  // Track which 2 fields the user wants to fill
  const [selectedFields, setSelectedFields] = useState<LoanFieldKey[]>(() => {
    // Default: loanAmount + preferredEMI (most common pair)
    return ["loanAmount", "preferredEMI"]
  })
  const [errors, setErrors] = useState<string>("")

  const toggleField = (key: LoanFieldKey) => {
    setSelectedFields((prev) => {
      if (prev.includes(key)) {
        // Prevent deselecting if only 2 are selected
        if (prev.length <= 2) return prev
        return prev.filter((f) => f !== key)
      } else {
        if (prev.length >= 2) {
          // Replace the oldest one to keep exactly 2
          return [prev[1], key]
        }
        return [...prev, key]
      }
    })
    setErrors("")
  }

  const validate = () => {
    if (!data.loanPurpose) {
      setErrors("Please select a loan purpose")
      return false
    }
    setErrors("")
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  return (
    <Card className="p-8 shadow-xl border-2 border-blue-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Loan Requirement</h2>
        <p className="text-gray-600">Tell us about your loan needs</p>
        <p className="text-xs text-blue-600 mt-1">All fields have sensible defaults — just click Continue if unsure.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Purpose */}
        <div>
          <Label className="text-base font-semibold mb-4 block">Loan Purpose *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loanPurposes.map((purpose) => (
              <button
                key={purpose.value}
                type="button"
                onClick={() => updateData({ loanPurpose: purpose.value })}
                className={`p-4 border-2 rounded-xl transition-all ${data.loanPurpose === purpose.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                  }`}
              >
                <purpose.icon
                  className={`w-6 h-6 mx-auto mb-2 ${data.loanPurpose === purpose.value ? "text-blue-600" : "text-gray-400"
                    }`}
                />
                <span
                  className={`text-xs font-medium ${data.loanPurpose === purpose.value ? "text-blue-700" : "text-gray-700"
                    }`}
                >
                  {purpose.label}
                </span>
              </button>
            ))}
          </div>
          {errors && <p className="text-red-600 text-sm mt-2">{errors}</p>}
        </div>

        {/* Any 2 of 3 Selector */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-blue-600" />
            <Label className="text-base font-semibold">Pick any 2 of the 3 loan parameters</Label>
          </div>
          <p className="text-xs text-gray-500 mb-3">We'll calculate the third one for you automatically!</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {LOAN_FIELDS.map((field) => {
              const isSelected = selectedFields.includes(field.key)
              return (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => toggleField(field.key)}
                  className={`p-3 border-2 rounded-xl text-left transition-all relative ${isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200 text-gray-500"
                    }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                  )}
                  <p className={`text-xs font-bold ${isSelected ? "text-blue-700" : "text-gray-600"}`}>
                    {field.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{field.description}</p>
                </button>
              )
            })}
          </div>

          {/* Loan Amount */}
          {selectedFields.includes("loanAmount") && (
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
              <Label htmlFor="amount" className="text-sm font-semibold">
                Required Loan Amount:{" "}
                <span className="text-blue-700">₹{(data.loanAmount || 100000).toLocaleString("en-IN")}</span>
              </Label>
              <Slider
                id="amount"
                min={10000}
                max={5000000}
                step={10000}
                value={[data.loanAmount || 100000]}
                onValueChange={(value) => updateData({ loanAmount: value[0] })}
                className="mt-3"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹10K</span>
                <span>₹50L</span>
              </div>
            </div>
          )}

          {/* Max EMI */}
          {selectedFields.includes("preferredEMI") && (
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
              <Label htmlFor="emi" className="text-sm font-semibold">
                Max Monthly EMI:{" "}
                <span className="text-blue-700">₹{(data.preferredEMI || 10000).toLocaleString("en-IN")}</span>
              </Label>
              <Slider
                id="emi"
                min={1000}
                max={100000}
                step={1000}
                value={[data.preferredEMI || 10000]}
                onValueChange={(value) => updateData({ preferredEMI: value[0] })}
                className="mt-3"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹1K</span>
                <span>₹1L</span>
              </div>
            </div>
          )}

          {/* Tenure */}
          {selectedFields.includes("tenure") && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold mb-3 block">Preferred Tenure</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {tenureOptions.map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => updateData({ tenure: years })}
                    className={`py-2 px-3 border-2 rounded-lg font-semibold transition-all text-sm ${data.tenure === years
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 hover:border-blue-200 text-gray-700"
                      }`}
                  >
                    {years}yr
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calculated field label */}
          {selectedFields.length === 2 && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Auto-calculated:{" "}
                {LOAN_FIELDS.find((f) => !selectedFields.includes(f.key))?.label}
              </Badge>
              <span className="text-xs text-gray-500">will be derived from your other inputs</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold group"
        >
          Finish & See Dashboard
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Card>
  )
}
