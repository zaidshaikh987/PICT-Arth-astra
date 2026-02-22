"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { OnboardingData } from "../types"
import { ArrowRight } from "lucide-react"

interface Props {
  data: OnboardingData
  updateData: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

// Indian states/regions → most spoken language
const REGION_LANGUAGE_MAP: Record<string, string> = {
  maharashtra: "mr", goa: "mr",
  "uttar pradesh": "hi", "madhya pradesh": "hi", rajasthan: "hi",
  bihar: "hi", jharkhand: "hi", chhattisgarh: "hi", haryana: "hi",
  "himachal pradesh": "hi", uttarakhand: "hi", delhi: "hi",
  "new delhi": "hi", chandigarh: "hi",
}

function detectLangFromRegion(region: string): string {
  const r = (region || "").toLowerCase()
  for (const [key, lang] of Object.entries(REGION_LANGUAGE_MAP)) {
    if (r.includes(key)) return lang
  }
  return "en"
}

export default function Step1BasicProfile({ data, updateData, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectFailed, setDetectFailed] = useState(false)

  const getLanguageLabel = (code?: string) => {
    if (!code) return ""
    if (code === "hi") return "Hindi"
    if (code === "mr") return "Marathi"
    if (code === "en") return "English"
    return code
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.phone || data.phone.length < 6) {
      newErrors.phone = "Please enter a valid phone number"
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

  useEffect(() => {
    if (typeof window === "undefined") return

    // Always do a fresh IP detection for accurate city/state/language
    const detect = async () => {
      setIsDetecting(true)
      setDetectFailed(false)

      let city = ""
      let region = ""
      let lang = "en"

      // Try primary API: ipapi.co
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const json = await res.json()
          city = json.city || ""
          region = json.region || ""
        }
      } catch { /* try fallback */ }

      // Fallback: ip-api.com
      if (!region) {
        try {
          const res = await fetch("http://ip-api.com/json/?fields=regionName,city", { signal: AbortSignal.timeout(5000) })
          if (res.ok) {
            const json = await res.json()
            city = json.city || ""
            region = json.regionName || ""
          }
        } catch { /* detection failed */ }
      }

      if (region) {
        lang = detectLangFromRegion(region)
        const payload: Partial<OnboardingData> = {}
        if (city) payload.city = city
        if (region) payload.state = region
        payload.language = lang
        updateData(payload)

        // Update localStorage cache for language-context too
        try {
          if (city) localStorage.setItem("detectedCity", city)
          if (region) localStorage.setItem("detectedRegion", region)
          localStorage.setItem("lang_detect_cache", JSON.stringify({ language: lang, city, region, ts: Date.now() }))
        } catch { /* ignore */ }

        setIsDetecting(false)
      } else {
        // No region detected — fall back to localStorage cache
        try {
          const cached = localStorage.getItem("lang_detect_cache")
          if (cached) {
            const obj = JSON.parse(cached)
            const payload: Partial<OnboardingData> = {}
            if (obj.city && !data.city) payload.city = obj.city
            if (obj.region && !data.state) payload.state = obj.region
            if (obj.language && !data.language) payload.language = obj.language
            if (Object.keys(payload).length > 0) updateData(payload)
          }
        } catch { /* ignore */ }
        setIsDetecting(false)
        setDetectFailed(true)
      }
    }

    detect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="p-8 shadow-xl border-2 border-blue-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Let&apos;s Get Started</h2>
        <p className="text-gray-600">Enter your phone number to continue</p>
        {isDetecting && (
          <p className="text-xs text-blue-600 mt-2">Detecting your location and local language in real time...</p>
        )}
        {!isDetecting && (data.city || data.state || data.language) && (
          <p className="text-xs text-blue-700 mt-2">
            We detected{" "}
            {data.city && data.state
              ? `${data.city}, ${data.state}`
              : data.city || data.state || "your location"}
            {data.language && ` • Most spoken language here: ${getLanguageLabel(data.language)}`}
          </p>
        )}
        {detectFailed && !data.city && !data.state && !data.language && (
          <p className="text-xs text-red-600 mt-2">Could not auto-detect your location. We&apos;ll start in English.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          {(data.city || data.state || data.language) && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs">
              <span className="font-semibold text-blue-700">Detected</span>
              <span className="text-blue-700">
                {(data.city || data.state) && (
                  <>
                    {data.city}
                    {data.city && data.state && ", "}
                    {data.state}
                  </>
                )}
                {data.language && (
                  <>
                    {(data.city || data.state) && " • "}
                    {getLanguageLabel(data.language)}
                  </>
                )}
              </span>
            </div>
          )}
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
