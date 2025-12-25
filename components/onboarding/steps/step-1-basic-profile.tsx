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
import { ArrowRight } from "lucide-react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export default function Step1BasicProfile({ data, updateData, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.name || data.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    if (!data.age || data.age < 18 || data.age > 100) {
      newErrors.age = "Age must be between 18 and 100"
    }
    if (!data.city || data.city.length < 2) {
      newErrors.city = "Please enter a valid city"
    }
    if (!data.state) {
      newErrors.state = "Please select a state"
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
    <Card className="p-8 shadow-xl border-2 border-emerald-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started</h2>
        <p className="text-gray-600">Tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="name" className="text-base font-semibold">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={data.name || ""}
            onChange={(e) => updateData({ name: e.target.value })}
            className="mt-2 h-12"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Age Slider */}
        <div>
          <Label htmlFor="age" className="text-base font-semibold">
            Age: {data.age || 25} years *
          </Label>
          <Slider
            id="age"
            min={18}
            max={100}
            step={1}
            value={[data.age || 25]}
            onValueChange={(value) => updateData({ age: value[0] })}
            className="mt-4"
          />
          {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
          {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone" className="text-base font-semibold">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +919876543210"
            value={data.phone || ""}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="mt-2 h-12"
          />
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city" className="text-base font-semibold">
            City *
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Enter your city"
            value={data.city || ""}
            onChange={(e) => updateData({ city: e.target.value })}
            className="mt-2 h-12"
          />
          {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <Label htmlFor="state" className="text-base font-semibold">
            State *
          </Label>
          <Select value={data.state || ""} onValueChange={(value) => updateData({ state: value })}>
            <SelectTrigger className="mt-2 h-12">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Gujarat">Gujarat</SelectItem>
              <SelectItem value="West Bengal">West Bengal</SelectItem>
              <SelectItem value="Rajasthan">Rajasthan</SelectItem>
              <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
            </SelectContent>
          </Select>
          {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
        </div>

        {/* Language Preference */}
        <div>
          <Label htmlFor="language" className="text-base font-semibold">
            Preferred Language
          </Label>
          <Select value={data.language || "en"} onValueChange={(value) => updateData({ language: value })}>
            <SelectTrigger className="mt-2 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
            </SelectContent>
          </Select>
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
