"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OnboardingData } from "../types"
import { ArrowRight } from "lucide-react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export default function Step3Financial({ data, updateData, onNext }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card className="p-8 shadow-xl border-2 border-emerald-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Snapshot</h2>
        <p className="text-gray-600">Understanding your current financial health</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Existing EMI */}
        <div>
          <Label htmlFor="emi" className="text-base font-semibold">
            Existing Monthly EMI: ₹{(data.existingEMI || 0).toLocaleString("en-IN")}
          </Label>
          <Slider
            id="emi"
            min={0}
            max={100000}
            step={1000}
            value={[data.existingEMI || 0]}
            onValueChange={(value) => updateData({ existingEMI: value[0] })}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹0</span>
            <span>₹1L</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div>
          <Label htmlFor="expenses" className="text-base font-semibold">
            Monthly Expenses (Optional): ₹{(data.monthlyExpenses || 0).toLocaleString("en-IN")}
          </Label>
          <Slider
            id="expenses"
            min={0}
            max={100000}
            step={1000}
            value={[data.monthlyExpenses || 0]}
            onValueChange={(value) => updateData({ monthlyExpenses: value[0] })}
            className="mt-4"
          />
        </div>

        {/* Savings Range */}
        <div>
          <Label htmlFor="savings" className="text-base font-semibold">
            Savings Range
          </Label>
          <Select value={data.savingsRange || ""} onValueChange={(value) => updateData({ savingsRange: value })}>
            <SelectTrigger className="mt-2 h-12">
              <SelectValue placeholder="Select savings range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50k">₹0 - ₹50,000</SelectItem>
              <SelectItem value="50k-1L">₹50,000 - ₹1,00,000</SelectItem>
              <SelectItem value="1L-5L">₹1,00,000 - ₹5,00,000</SelectItem>
              <SelectItem value="5L+">₹5,00,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Credit History */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="creditHistory" className="text-base font-semibold">
                Do you have credit history?
              </Label>
              <p className="text-sm text-gray-600 mt-1">Have you taken any loans or credit cards before?</p>
            </div>
            <Switch
              id="creditHistory"
              checked={data.hasCreditHistory || false}
              onCheckedChange={(checked) => updateData({ hasCreditHistory: checked })}
            />
          </div>

          {/* Credit Score (conditional) */}
          {data.hasCreditHistory && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Label htmlFor="creditScore" className="text-base font-semibold">
                Approximate Credit Score: {data.creditScore || 700}
              </Label>
              <Slider
                id="creditScore"
                min={300}
                max={900}
                step={10}
                value={[data.creditScore || 700]}
                onValueChange={(value) => updateData({ creditScore: value[0] })}
                className="mt-4"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>300 (Poor)</span>
                <span>900 (Excellent)</span>
              </div>
            </div>
          )}
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
