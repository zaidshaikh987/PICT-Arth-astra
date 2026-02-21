"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OnboardingData } from "../types"
import { ArrowRight, Briefcase, Building, Laptop, GraduationCap } from "lucide-react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

const employmentTypes = [
  { value: "salaried", label: "Salaried", icon: Briefcase },
  { value: "self_employed", label: "Self-Employed", icon: Building },
  { value: "freelancer", label: "Freelancer", icon: Laptop },
  { value: "student", label: "Student", icon: GraduationCap },
]

export default function Step2Employment({ data, updateData, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.employmentType) {
      newErrors.employmentType = "Please select employment type"
    }
    if (!data.monthlyIncome || data.monthlyIncome < 10000) {
      newErrors.monthlyIncome = "Please enter a valid monthly income"
    }
    if (!data.employmentTenure) {
      newErrors.employmentTenure = "Please select employment tenure"
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

  return (
    <Card className="p-8 shadow-xl border-2 border-blue-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Employment Details</h2>
        <p className="text-gray-600">Help us understand your income stability</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employment Type Selection */}
        <div>
          <Label className="text-base font-semibold mb-4 block">Employment Type *</Label>
          <div className="grid grid-cols-2 gap-4">
            {employmentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateData({ employmentType: type.value })}
                className={`p-4 border-2 rounded-xl transition-all ${data.employmentType === type.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                  }`}
              >
                <type.icon
                  className={`w-8 h-8 mx-auto mb-2 ${data.employmentType === type.value ? "text-blue-600" : "text-gray-400"
                    }`}
                />
                <span
                  className={`text-sm font-medium ${data.employmentType === type.value ? "text-blue-700" : "text-gray-700"
                    }`}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>
          {errors.employmentType && <p className="text-red-600 text-sm mt-1">{errors.employmentType}</p>}
        </div>

        {/* Monthly Income Slider */}
        <div>
          <Label htmlFor="income" className="text-base font-semibold">
            Monthly Income: ₹{(data.monthlyIncome || 30000).toLocaleString("en-IN")} *
          </Label>
          <Slider
            id="income"
            min={10000}
            max={500000}
            step={5000}
            value={[data.monthlyIncome || 30000]}
            onValueChange={(value) => updateData({ monthlyIncome: value[0] })}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹10K</span>
            <span>₹5L</span>
          </div>
          {errors.monthlyIncome && <p className="text-red-600 text-sm mt-1">{errors.monthlyIncome}</p>}
        </div>

        {/* Employment Tenure */}
        <div>
          <Label htmlFor="tenure" className="text-base font-semibold">
            Employment Tenure *
          </Label>
          <Select
            value={data.employmentTenure || ""}
            onValueChange={(value) => updateData({ employmentTenure: value })}
          >
            <SelectTrigger className="mt-2 h-12">
              <SelectValue placeholder="Select tenure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<6_months">Less than 6 months</SelectItem>
              <SelectItem value="6m-1yr">6 months - 1 year</SelectItem>
              <SelectItem value="1-2yr">1-2 years</SelectItem>
              <SelectItem value="2-5yr">2-5 years</SelectItem>
              <SelectItem value="5+yr">5+ years</SelectItem>
            </SelectContent>
          </Select>
          {errors.employmentTenure && <p className="text-red-600 text-sm mt-1">{errors.employmentTenure}</p>}
        </div>

        {/* Company Name (Optional) */}
        <div>
          <Label htmlFor="company" className="text-base font-semibold">
            Company Name (Optional)
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="Enter company name"
            value={data.companyName || ""}
            onChange={(e) => updateData({ companyName: e.target.value })}
            className="mt-2 h-12"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold group"
        >
          Continue
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Card>
  )
}
