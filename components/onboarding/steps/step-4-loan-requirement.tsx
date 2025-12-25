"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { OnboardingData } from "../types"
import { ArrowRight, GraduationCap, User, Briefcase, Home, Car, Heart, Users, Plane } from "lucide-react"

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

export default function Step4LoanRequirement({ data, updateData, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.loanPurpose) {
      newErrors.loanPurpose = "Please select loan purpose"
    }
    if (!data.loanAmount || data.loanAmount < 10000) {
      newErrors.loanAmount = "Please enter a valid loan amount"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  const tenureOptions = [1, 2, 3, 5, 7, 10]

  return (
    <Card className="p-8 shadow-xl border-2 border-emerald-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Loan Requirement</h2>
        <p className="text-gray-600">Tell us about your loan needs</p>
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
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
                  }`}
              >
                <purpose.icon
                  className={`w-6 h-6 mx-auto mb-2 ${data.loanPurpose === purpose.value ? "text-emerald-600" : "text-gray-400"
                    }`}
                />
                <span
                  className={`text-xs font-medium ${data.loanPurpose === purpose.value ? "text-emerald-700" : "text-gray-700"
                    }`}
                >
                  {purpose.label}
                </span>
              </button>
            ))}
          </div>
          {errors.loanPurpose && <p className="text-red-600 text-sm mt-1">{errors.loanPurpose}</p>}
        </div>

        {/* Loan Amount */}
        <div>
          <Label htmlFor="amount" className="text-base font-semibold">
            Required Loan Amount: ₹{(data.loanAmount || 100000).toLocaleString("en-IN")} *
          </Label>
          <Slider
            id="amount"
            min={10000}
            max={5000000}
            step={10000}
            value={[data.loanAmount || 100000]}
            onValueChange={(value) => updateData({ loanAmount: value[0] })}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹10K</span>
            <span>₹50L</span>
          </div>
          {errors.loanAmount && <p className="text-red-600 text-sm mt-1">{errors.loanAmount}</p>}
        </div>

        {/* Preferred EMI */}
        <div>
          <Label htmlFor="emi" className="text-base font-semibold">
            Preferred Maximum EMI: ₹{(data.preferredEMI || 10000).toLocaleString("en-IN")}
          </Label>
          <Slider
            id="emi"
            min={1000}
            max={100000}
            step={1000}
            value={[data.preferredEMI || 10000]}
            onValueChange={(value) => updateData({ preferredEMI: value[0] })}
            className="mt-4"
          />
        </div>

        {/* Tenure */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Preferred Tenure</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {tenureOptions.map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => updateData({ tenure: years })}
                className={`py-3 px-4 border-2 rounded-lg font-semibold transition-all ${data.tenure === years
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 hover:border-emerald-200 text-gray-700"
                  }`}
              >
                {years} {years === 1 ? "yr" : "yrs"}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-semibold group"
        >
          Continue
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Card>
  )
}
